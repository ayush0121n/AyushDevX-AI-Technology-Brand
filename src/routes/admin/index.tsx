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

// ─── Upload Form ──────────────────────────────────────────────────────────────

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

// ─── Main Admin Page ──────────────────────────────────────────────────────────

function AdminPage() {
  const { isChecking, isAdmin, adminEmail, adminToken, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<"upload" | "manage">("manage");
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

  const handleRefresh = useCallback(() => {
    refetchResources();
    queryClient.invalidateQueries({ queryKey: ["knowledge-hub-resources"] });
  }, [refetchResources, queryClient]);

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

  const publishedCount = resources.filter((r) => r.status === "published").length;
  const draftCount = resources.filter((r) => r.status === "draft").length;
  const totalDownloads = resources.reduce((acc, r) => acc + r.download_count, 0);

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
          <h1 className="font-display text-4xl md:text-5xl">Knowledge Hub</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload and manage PDF documents for the public Knowledge Hub library.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Documents", value: resources.length },
            { label: "Published", value: publishedCount },
            { label: "Drafts", value: draftCount },
            { label: "Total Downloads", value: totalDownloads },
          ].map((stat) => (
            <div key={stat.label} className="border border-border bg-card p-6">
              <p className="text-3xl font-display text-flame">{stat.value}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border pb-4">
          {[
            { id: "manage", label: "Manage Resources" },
            { id: "upload", label: "Upload New PDF" },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as "upload" | "manage")}
              className={`px-5 py-2.5 text-xs uppercase tracking-[0.2em] border transition-colors ${
                activeTab === tab.id
                  ? "bg-flame text-ink border-flame font-medium"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        <AnimatePresence mode="wait">
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
        </AnimatePresence>
      </div>
    </main>
  );
}
