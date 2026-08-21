import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  fetchAllResources,
  fetchCategories,
  adminUploadResource,
  adminUpdateResourceStatus,
  adminDeleteResource,
} from "@/api/knowledge-hub";
import {
  fetchAllBlogPosts,
  adminCreateBlogPost,
  adminUpdateBlogPostStatus,
  adminDeleteBlogPost,
} from "@/api/blog";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — Admin Dashboard" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminResource {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  storage_path: string | null;
  file_url: string | null;
  file_size: number | null;
  file_type: string | null;
  tags: string[];
  download_count: number;
  status: "draft" | "published";
  featured: boolean;
  created_at: string;
  updated_at: string;
  resource_categories: { id: string; name: string; slug: string } | null;
}

interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  cover_image_path: string | null;
  pdf_path: string | null;
  pdf_title: string | null;
  tags: string[];
  category: string | null;
  featured: boolean;
  status: "draft" | "published";
  read_time_minutes: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ─── Auth Guard Hook ──────────────────────────────────────────────────────────

function useAdminAuth() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          await navigate({ to: "/admin/login" });
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        const profileData = profile as { role: string } | null;
        if (!profileData || profileData.role !== "admin") {
          await supabase.auth.signOut();
          await navigate({ to: "/admin/login" });
          return;
        }

        setIsAdmin(true);
        setAdminEmail(session.user.email ?? null);
        setAdminToken(session.access_token);
      } catch {
        await navigate({ to: "/admin/login" });
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, [navigate]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/admin/login" });
  }, [navigate]);

  return { isChecking, isAdmin, adminEmail, adminToken, signOut };
}

// ─── Upload Form (PDF Resource) ───────────────────────────────────────────────

function UploadForm({
  categories,
  adminToken,
  onSuccess,
}: {
  categories: Category[];
  adminToken: string;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    setSelectedFile(null);

    if (!file) return;

    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 15) {
      setFileError(`File is too large (${sizeMb.toFixed(1)} MB). Maximum 15 MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedFile || isUploading) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const result = await adminUploadResource({
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          categoryId: categoryId || undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          fileBase64: base64,
          fileName: selectedFile.name,
          fileSizeMb: selectedFile.size / (1024 * 1024),
          featured,
          status,
          accessToken: adminToken,
        },
      });

      if (!result.success) {
        setUploadError(result.error ?? "Upload failed.");
        return;
      }

      setUploadSuccess(true);
      setTitle("");
      setDescription("");
      setCategoryId("");
      setTags("");
      setFeatured(false);
      setStatus("published");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess();

      setTimeout(() => setUploadSuccess(false), 4000);
    } catch {
      setUploadError("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="resource-title"
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
        >
          Title <span className="text-flame">*</span>
        </label>
        <input
          id="resource-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Production RAG Architecture Guide"
          required
          maxLength={200}
          className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="resource-desc"
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
        >
          Description
        </label>
        <textarea
          id="resource-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this document..."
          maxLength={1000}
          className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="resource-category"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
          >
            Category
          </label>
          <select
            id="resource-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
          >
            <option value="">— No Category —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="resource-status"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
          >
            Status
          </label>
          <select
            id="resource-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "published" | "draft")}
            className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
          >
            <option value="published">Published (Visible)</option>
            <option value="draft">Draft (Hidden)</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="resource-tags"
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
        >
          Tags{" "}
          <span className="text-muted-foreground/60 normal-case text-[0.6rem]">
            (comma-separated)
          </span>
        </label>
        <input
          id="resource-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="RAG, Vector DB, AI, Machine Learning"
          className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          id="resource-featured-toggle"
          onClick={() => setFeatured((v) => !v)}
          className={`w-10 h-5 rounded-full relative transition-colors ${
            featured ? "bg-flame" : "bg-muted border border-border"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              featured ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
          Featured resource
        </span>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="resource-file"
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
        >
          PDF File <span className="text-flame">*</span>
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            selectedFile
              ? "border-flame/60 bg-flame/5"
              : "border-border hover:border-foreground/40 bg-background"
          }`}
        >
          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-flame">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · PDF
              </p>
              <p className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wider mt-2">
                Click to change file
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-flame text-xl mx-auto">
                ↑
              </div>
              <p className="text-sm text-muted-foreground">Click to select PDF</p>
              <p className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wider">
                Max 15 MB · PDF only
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          id="resource-file"
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        {fileError && <p className="text-xs text-destructive">{fileError}</p>}
      </div>

      <AnimatePresence mode="wait">
        {uploadError && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 border border-destructive/40 bg-destructive/5 text-xs text-destructive"
          >
            {uploadError}
          </motion.div>
        )}
        {uploadSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 border border-flame/40 bg-flame/5 text-xs text-flame"
          >
            ✓ Resource uploaded and published successfully.
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        id="upload-resource-button"
        disabled={isUploading || !title.trim() || !selectedFile}
        className="w-full py-3.5 bg-flame text-ink text-xs uppercase tracking-[0.2em] font-medium hover:bg-flame/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isUploading && (
          <span className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
        )}
        {isUploading ? "Uploading to Supabase Storage..." : "Upload & Publish →"}
      </button>
    </form>
  );
}

// ─── Resources Table ──────────────────────────────────────────────────────────

function ResourcesTable({
  resources,
  adminToken,
  onRefresh,
}: {
  resources: AdminResource[];
  adminToken: string;
  onRefresh: () => void;
}) {
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({});

  const setAction = (id: string, loading: boolean) => {
    setActionStates((prev) => ({ ...prev, [id]: loading }));
  };

  const handleToggleStatus = async (resource: AdminResource) => {
    setAction(resource.id, true);
    try {
      const newStatus = resource.status === "published" ? "draft" : "published";
      const result = await adminUpdateResourceStatus({
        data: { resourceId: resource.id, status: newStatus, accessToken: adminToken },
      });
      if (result.success) onRefresh();
    } finally {
      setAction(resource.id, false);
    }
  };

  const handleDelete = async (resource: AdminResource) => {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;

    setAction(`del-${resource.id}`, true);
    try {
      const result = await adminDeleteResource({
        data: {
          resourceId: resource.id,
          storagePath: resource.storage_path ?? undefined,
          accessToken: adminToken,
        },
      });
      if (result.success) onRefresh();
    } finally {
      setAction(`del-${resource.id}`, false);
    }
  };

  if (resources.length === 0) {
    return (
      <div className="p-12 border border-border text-center text-muted-foreground text-sm">
        No resources found. Upload your first PDF above.
      </div>
    );
  }

  return (
    <div className="border border-border overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b border-border text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
        <div className="col-span-5">Title / Category</div>
        <div className="col-span-2">Type / Size</div>
        <div className="col-span-1 text-center">DLs</div>
        <div className="col-span-2 text-center">Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {resources.map((res, i) => (
        <motion.div
          key={res.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors items-center"
        >
          <div className="md:col-span-5 space-y-1">
            <p className="text-sm font-medium leading-tight line-clamp-2">{res.title}</p>
            <div className="flex items-center gap-2">
              {res.resource_categories?.name && (
                <span className="text-[0.6rem] uppercase tracking-[0.15em] text-flame/80">
                  {res.resource_categories.name}
                </span>
              )}
              {res.featured && (
                <span className="text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 bg-flame/10 text-flame border border-flame/20">
                  ★ Featured
                </span>
              )}
            </div>
            <p className="text-[0.65rem] text-muted-foreground/60 font-mono">
              {formatDate(res.created_at)}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs font-medium">{res.file_type ?? "PDF"}</p>
            <p className="text-[0.65rem] text-muted-foreground">{formatFileSize(res.file_size)}</p>
          </div>

          <div className="md:col-span-1 text-center">
            <span className="text-sm font-mono text-foreground/70">{res.download_count}</span>
          </div>

          <div className="md:col-span-2 flex justify-center">
            <button
              onClick={() => handleToggleStatus(res)}
              disabled={actionStates[res.id]}
              className={`text-[0.65rem] uppercase tracking-[0.15em] px-3 py-1.5 border transition-colors font-medium ${
                res.status === "published"
                  ? "bg-flame/10 text-flame border-flame/30 hover:bg-flame/20"
                  : "bg-muted text-muted-foreground border-border hover:border-foreground/40"
              } disabled:opacity-50`}
            >
              {actionStates[res.id] ? "..." : res.status === "published" ? "Published" : "Draft"}
            </button>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              onClick={() => handleDelete(res)}
              disabled={actionStates[`del-${res.id}`]}
              className="text-[0.65rem] uppercase tracking-[0.15em] px-3 py-1.5 border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              {actionStates[`del-${res.id}`] ? "..." : "Delete"}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Blog Create Form ─────────────────────────────────────────────────────────

function BlogCreateForm({
  adminToken,
  onSuccess,
}: {
  adminToken: string;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"published" | "draft">("published");

  // Cover image
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Attached PDF
  const [pdfPath, setPdfPath] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCoverError(null);
    setCoverFile(null);
    setCoverPreview(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCoverError("Only image files are allowed (JPG, PNG, WebP).");
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 10) {
      setCoverError(`Image too large (${sizeMb.toFixed(1)} MB). Maximum 10 MB.`);
      return;
    }

    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !slug.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      let coverImageBase64: string | undefined;
      let coverImageFileName: string | undefined;

      if (coverFile && coverPreview) {
        coverImageBase64 = coverPreview;
        coverImageFileName = coverFile.name;
      }

      const result = await adminCreateBlogPost({
        data: {
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || undefined,
          body: body.trim(),
          coverImageBase64,
          coverImageFileName,
          pdfPath: pdfPath.trim() || undefined,
          pdfUrl: pdfUrl.trim() || undefined,
          pdfTitle: pdfTitle.trim() || undefined,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          category: category.trim() || undefined,
          featured,
          status,
          accessToken: adminToken,
        },
      });

      if (!result.success) {
        setSubmitError(result.error ?? "Failed to create post.");
        return;
      }

      setSubmitSuccess(true);
      setTitle(""); setSlug(""); setSlugManual(false);
      setExcerpt(""); setBody(""); setCategory(""); setTags("");
      setFeatured(false); setStatus("published");
      setCoverFile(null); setCoverPreview(null);
      setPdfPath(""); setPdfUrl(""); setPdfTitle("");
      if (coverInputRef.current) coverInputRef.current.value = "";
      onSuccess();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch {
      setSubmitError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="blog-title" className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
          Title <span className="text-flame">*</span>
        </label>
        <input
          id="blog-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Building a Production RAG Pipeline"
          required
          maxLength={200}
          className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <label htmlFor="blog-slug" className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
          URL Slug <span className="text-flame">*</span>{" "}
          <span className="text-muted-foreground/60 normal-case text-[0.6rem]">(lowercase-with-hyphens)</span>
        </label>
        <input
          id="blog-slug"
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
          placeholder="building-a-production-rag-pipeline"
          required
          pattern="^[a-z0-9-]+$"
          className="w-full bg-background border border-border px-4 py-3 text-sm font-mono focus:outline-none focus:border-flame transition-colors"
        />
        <p className="text-[0.65rem] text-muted-foreground">
          Post will be at: /knowledge-hub/blog/{slug || "your-slug"}
        </p>
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <label htmlFor="blog-excerpt" className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
          Excerpt{" "}
          <span className="text-muted-foreground/60 normal-case text-[0.6rem]">(shown in card preview)</span>
        </label>
        <textarea
          id="blog-excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short summary of the article..."
          maxLength={500}
          className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors resize-none"
        />
      </div>

      {/* Body (Markdown) */}
      <div className="space-y-2">
        <label htmlFor="blog-body" className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
          Body <span className="text-flame">*</span>{" "}
          <span className="text-muted-foreground/60 normal-case text-[0.6rem]">(Markdown supported)</span>
        </label>
        <textarea
          id="blog-body"
          rows={16}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`# Introduction\n\nWrite your article in **Markdown**...\n\n## Section\n\nContent here.\n\n\`\`\`js\nconst hello = 'world';\n\`\`\`\n\n![Image Alt Text](https://example.com/image.png)`}
          required
          className="w-full bg-background border border-border px-4 py-3 text-sm font-mono focus:outline-none focus:border-flame transition-colors resize-y"
        />
        <p className="text-[0.65rem] text-muted-foreground">
          Supports: **bold**, *italic*, # headings, `code`, ```code blocks```, ![image](url), [link](url), &gt; blockquotes, - lists
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <label htmlFor="blog-category" className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
            Category
          </label>
          <input
            id="blog-category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. AI Engineering"
            className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label htmlFor="blog-status" className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
            Status
          </label>
          <select
            id="blog-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "published" | "draft")}
            className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
          >
            <option value="published">Published (Visible)</option>
            <option value="draft">Draft (Hidden)</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label htmlFor="blog-tags" className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
          Tags{" "}
          <span className="text-muted-foreground/60 normal-case text-[0.6rem]">(comma-separated)</span>
        </label>
        <input
          id="blog-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="RAG, Vector DB, AI, LLM"
          className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
        />
      </div>

      {/* Featured toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          id="blog-featured-toggle"
          onClick={() => setFeatured((v) => !v)}
          className={`w-10 h-5 rounded-full relative transition-colors ${
            featured ? "bg-flame" : "bg-muted border border-border"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              featured ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
          Featured post (shown prominently)
        </span>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <label htmlFor="blog-cover" className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
          Cover Image{" "}
          <span className="text-muted-foreground/60 normal-case text-[0.6rem]">(optional · JPG/PNG/WebP · max 10 MB)</span>
        </label>
        <div
          onClick={() => coverInputRef.current?.click()}
          className={`border-2 border-dashed cursor-pointer transition-colors overflow-hidden ${
            coverPreview
              ? "border-flame/60 bg-flame/5"
              : "border-border hover:border-foreground/40 bg-background p-8 text-center"
          }`}
        >
          {coverPreview ? (
            <div className="relative">
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs uppercase tracking-[0.2em]">Click to Change</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-flame text-xl mx-auto">
                🖼
              </div>
              <p className="text-sm text-muted-foreground">Click to upload cover image</p>
            </div>
          )}
        </div>
        <input
          ref={coverInputRef}
          id="blog-cover"
          type="file"
          accept="image/*"
          onChange={handleCoverSelect}
          className="hidden"
        />
        {coverError && <p className="text-xs text-destructive">{coverError}</p>}
      </div>

      {/* Attached PDF section */}
      <div className="border border-border bg-muted/10 p-5 space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Attach a PDF Note (Optional)
        </p>
        <div className="space-y-2">
          <label htmlFor="blog-pdf-title" className="text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground/70 block">
            PDF Display Title
          </label>
          <input
            id="blog-pdf-title"
            type="text"
            value={pdfTitle}
            onChange={(e) => setPdfTitle(e.target.value)}
            placeholder="e.g. Detailed RAG Architecture Notes"
            className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-flame transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="blog-pdf-url" className="text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground/70 block">
            PDF URL{" "}
            <span className="text-muted-foreground/50 normal-case">(signed URL or public link)</span>
          </label>
          <input
            id="blog-pdf-url"
            type="url"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            placeholder="https://... or a Supabase Storage URL"
            className="w-full bg-background border border-border px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-flame transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="blog-pdf-path" className="text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground/70 block">
            Storage Path{" "}
            <span className="text-muted-foreground/50 normal-case">(optional, for internal reference)</span>
          </label>
          <input
            id="blog-pdf-path"
            type="text"
            value={pdfPath}
            onChange={(e) => setPdfPath(e.target.value)}
            placeholder="pdfs/my-file.pdf"
            className="w-full bg-background border border-border px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-flame transition-colors"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {submitError && (
          <motion.div
            key="err"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 border border-destructive/40 bg-destructive/5 text-xs text-destructive"
          >
            {submitError}
          </motion.div>
        )}
        {submitSuccess && (
          <motion.div
            key="ok"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 border border-flame/40 bg-flame/5 text-xs text-flame"
          >
            ✓ Blog post created successfully.
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        id="create-blog-post-button"
        disabled={isSubmitting || !title.trim() || !body.trim() || !slug.trim()}
        className="w-full py-3.5 bg-flame text-ink text-xs uppercase tracking-[0.2em] font-medium hover:bg-flame/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <span className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
        )}
        {isSubmitting ? "Publishing..." : "Create Blog Post →"}
      </button>
    </form>
  );
}

// ─── Blog Posts Table ──────────────────────────────────────────────────────────

function BlogPostsTable({
  posts,
  adminToken,
  onRefresh,
}: {
  posts: AdminBlogPost[];
  adminToken: string;
  onRefresh: () => void;
}) {
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({});

  const setAction = (id: string, loading: boolean) => {
    setActionStates((prev) => ({ ...prev, [id]: loading }));
  };

  const handleToggleStatus = async (post: AdminBlogPost) => {
    setAction(post.id, true);
    try {
      const newStatus = post.status === "published" ? "draft" : "published";
      const result = await adminUpdateBlogPostStatus({
        data: { postId: post.id, status: newStatus, accessToken: adminToken },
      });
      if (result.success) onRefresh();
    } finally {
      setAction(post.id, false);
    }
  };

  const handleDelete = async (post: AdminBlogPost) => {
    if (!window.confirm(`Delete blog post "${post.title}"? This cannot be undone.`)) return;

    setAction(`del-${post.id}`, true);
    try {
      const result = await adminDeleteBlogPost({
        data: {
          postId: post.id,
          coverImagePath: post.cover_image_path ?? undefined,
          accessToken: adminToken,
        },
      });
      if (result.success) onRefresh();
    } finally {
      setAction(`del-${post.id}`, false);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="p-12 border border-border text-center text-muted-foreground text-sm">
        No blog posts yet. Create your first post above.
      </div>
    );
  }

  return (
    <div className="border border-border overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b border-border text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
        <div className="col-span-5">Title / Slug</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-1 text-center">Views</div>
        <div className="col-span-2 text-center">Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors items-center"
        >
          <div className="md:col-span-5 flex items-center gap-3">
            {post.cover_image_url && (
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-12 h-10 object-cover rounded border border-border shrink-0 hidden sm:block"
              />
            )}
            <div className="space-y-0.5 min-w-0">
              <p className="text-sm font-medium leading-tight line-clamp-2">{post.title}</p>
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-mono text-muted-foreground/60 truncate">
                  /blog/{post.slug}
                </span>
                {post.featured && (
                  <span className="text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 bg-flame/10 text-flame border border-flame/20 shrink-0">
                    ★
                  </span>
                )}
              </div>
              <p className="text-[0.65rem] text-muted-foreground/60 font-mono">
                {formatDate(post.created_at)} · {post.read_time_minutes} min read
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs text-muted-foreground">{post.category ?? "—"}</p>
            {post.tags.length > 0 && (
              <p className="text-[0.6rem] text-muted-foreground/50 truncate">
                {post.tags.slice(0, 3).join(", ")}
              </p>
            )}
          </div>

          <div className="md:col-span-1 text-center">
            <span className="text-sm font-mono text-foreground/70">{post.view_count}</span>
          </div>

          <div className="md:col-span-2 flex justify-center">
            <button
              onClick={() => handleToggleStatus(post)}
              disabled={actionStates[post.id]}
              className={`text-[0.65rem] uppercase tracking-[0.15em] px-3 py-1.5 border transition-colors font-medium ${
                post.status === "published"
                  ? "bg-flame/10 text-flame border-flame/30 hover:bg-flame/20"
                  : "bg-muted text-muted-foreground border-border hover:border-foreground/40"
              } disabled:opacity-50`}
            >
              {actionStates[post.id] ? "..." : post.status === "published" ? "Published" : "Draft"}
            </button>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <a
              href={`/knowledge-hub/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.65rem] uppercase tracking-[0.15em] px-3 py-1.5 border border-border text-muted-foreground hover:border-foreground/40 transition-colors"
            >
              View
            </a>
            <button
              onClick={() => handleDelete(post)}
              disabled={actionStates[`del-${post.id}`]}
              className="text-[0.65rem] uppercase tracking-[0.15em] px-3 py-1.5 border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              {actionStates[`del-${post.id}`] ? "..." : "Delete"}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

function AdminPage() {
  const { isChecking, isAdmin, adminEmail, adminToken, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<"manage" | "upload" | "blog-manage" | "blog-create">("manage");
  const queryClient = useQueryClient();

  const {
    data: resourcesData,
    isLoading: resourcesLoading,
    refetch: refetchResources,
  } = useQuery({
    queryKey: ["admin-resources", adminToken],
    queryFn: () => fetchAllResources({ data: { accessToken: adminToken! } }),
    enabled: !!adminToken,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["resource-categories"],
    queryFn: () => fetchCategories(),
    enabled: isAdmin,
  });

  const {
    data: blogData,
    isLoading: blogLoading,
    refetch: refetchBlog,
  } = useQuery({
    queryKey: ["admin-blog-posts", adminToken],
    queryFn: () => fetchAllBlogPosts({ data: { accessToken: adminToken! } }),
    enabled: !!adminToken,
  });

  const handleRefresh = useCallback(() => {
    refetchResources();
    queryClient.invalidateQueries({ queryKey: ["knowledge-hub-resources"] });
  }, [refetchResources, queryClient]);

  const handleBlogRefresh = useCallback(() => {
    refetchBlog();
    queryClient.invalidateQueries({ queryKey: ["blog-posts-public"] });
  }, [refetchBlog, queryClient]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="w-5 h-5 border-2 border-flame border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-[0.2em]">Verifying session…</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const resources = (resourcesData?.resources ?? []) as AdminResource[];
  const categories = (categoriesData?.categories ?? []) as Category[];
  const blogPosts = (blogData?.posts ?? []) as AdminBlogPost[];

  const publishedCount = resources.filter((r) => r.status === "published").length;
  const draftCount = resources.filter((r) => r.status === "draft").length;
  const totalDownloads = resources.reduce((acc, r) => acc + r.download_count, 0);
  const publishedBlogCount = blogPosts.filter((p) => p.status === "published").length;
  const totalBlogViews = blogPosts.reduce((acc, p) => acc + p.view_count, 0);

  const tabs = [
    { id: "manage", label: "Manage Library", section: "library" },
    { id: "upload", label: "Upload PDF", section: "library" },
    { id: "blog-manage", label: "Manage Blog", section: "blog" },
    { id: "blog-create", label: "New Blog Post", section: "blog" },
  ] as const;

  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* ── Admin Nav ── */}
      <header className="border-b border-border px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="flex items-center gap-4">
          <span className="font-display text-xl tracking-tight">
            AyushDevX<sup className="text-flame text-xs">®</sup>
          </span>
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground border border-border px-2 py-0.5">
            Admin Console
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground hidden md:block">{adminEmail}</span>
          <a
            href="/"
            className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
          >
            View Site
          </a>
          <button
            onClick={signOut}
            id="admin-signout-button"
            className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-destructive transition-colors"
          >
            Sign Out →
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl">Admin Console</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage the Knowledge Hub library and blog posts.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
          {[
            { label: "Total Docs", value: resources.length },
            { label: "Published Docs", value: publishedCount },
            { label: "Draft Docs", value: draftCount },
            { label: "Downloads", value: totalDownloads },
            { label: "Published Posts", value: publishedBlogCount },
            { label: "Blog Views", value: totalBlogViews },
          ].map((stat) => (
            <div key={stat.label} className="border border-border bg-card p-5">
              <p className="text-2xl font-display text-flame">{stat.value}</p>
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs — grouped */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
          {/* Library group */}
          <div className="flex gap-1.5 items-center">
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/60 pr-1">
              Library
            </span>
            {tabs.filter((t) => t.section === "library").map((tab) => (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.2em] border transition-colors ${
                  activeTab === tab.id
                    ? "bg-flame text-ink border-flame font-medium"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="border-l border-border mx-2" />

          {/* Blog group */}
          <div className="flex gap-1.5 items-center">
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/60 pr-1">
              Blog
            </span>
            {tabs.filter((t) => t.section === "blog").map((tab) => (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.2em] border transition-colors ${
                  activeTab === tab.id
                    ? "bg-flame text-ink border-flame font-medium"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panels */}
        <AnimatePresence mode="wait">
          {/* Manage Library */}
          {activeTab === "manage" && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {resourcesLoading ? (
                <div className="p-12 border border-border text-center">
                  <span className="w-8 h-8 border-2 border-flame border-t-transparent rounded-full animate-spin inline-block" />
                </div>
              ) : (
                <ResourcesTable resources={resources} adminToken={adminToken!} onRefresh={handleRefresh} />
              )}
            </motion.div>
          )}

          {/* Upload PDF */}
          {activeTab === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl"
            >
              <div className="border border-border bg-card p-8">
                <h2 className="font-display text-2xl mb-6">Upload New Document</h2>
                <UploadForm
                  categories={categories}
                  adminToken={adminToken!}
                  onSuccess={() => {
                    handleRefresh();
                    setActiveTab("manage");
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Manage Blog */}
          {activeTab === "blog-manage" && (
            <motion.div
              key="blog-manage"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {blogLoading ? (
                <div className="p-12 border border-border text-center">
                  <span className="w-8 h-8 border-2 border-flame border-t-transparent rounded-full animate-spin inline-block" />
                </div>
              ) : (
                <BlogPostsTable posts={blogPosts} adminToken={adminToken!} onRefresh={handleBlogRefresh} />
              )}
            </motion.div>
          )}

          {/* Create Blog Post */}
          {activeTab === "blog-create" && (
            <motion.div
              key="blog-create"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl"
            >
              <div className="border border-border bg-card p-8">
                <h2 className="font-display text-2xl mb-6">Create Blog Post</h2>
                <BlogCreateForm
                  adminToken={adminToken!}
                  onSuccess={() => {
                    handleBlogRefresh();
                    setActiveTab("blog-manage");
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
