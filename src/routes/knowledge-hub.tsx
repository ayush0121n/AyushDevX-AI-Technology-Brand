import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPublishedResources,
  getDownloadUrl,
} from "@/api/knowledge-hub";
import { fetchPublishedBlogPosts } from "@/api/blog";

export const Route = createFileRoute("/knowledge-hub")({
  component: KnowledgeHubPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — Knowledge Hub & Research Library" },
      {
        name: "description",
        content:
          "Access curated engineering whitepapers, AI research guides, architectural blueprints, full-stack documentation, and blog posts by AyushDevX.",
      },
    ],
  }),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResourceRow {
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
  featured: boolean;
  created_at: string;
  resource_categories: { id: string; name: string; slug: string } | null;
}

interface BlogPostCard {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[];
  category: string | null;
  featured: boolean;
  read_time_minutes: number;
  view_count: number;
  created_at: string;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ResourceSkeleton() {
  return (
    <div className="border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-3">
          <div className="h-5 w-28 bg-muted rounded-sm" />
          <div className="h-4 w-20 bg-muted/60 rounded-sm" />
        </div>
        <div className="h-8 w-3/4 bg-muted rounded-sm" />
        <div className="h-4 w-full bg-muted/60 rounded-sm" />
        <div className="h-4 w-2/3 bg-muted/50 rounded-sm" />
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="h-10 w-28 bg-muted rounded-sm" />
        <div className="h-10 w-32 bg-muted/60 rounded-sm" />
      </div>
    </div>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="border border-border bg-card animate-pulse overflow-hidden">
      <div className="h-48 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-24 bg-muted rounded-sm" />
        <div className="h-6 w-3/4 bg-muted rounded-sm" />
        <div className="h-4 w-full bg-muted/60 rounded-sm" />
        <div className="h-4 w-2/3 bg-muted/50 rounded-sm" />
      </div>
    </div>
  );
}

// ─── Download Button ──────────────────────────────────────────────────────────

function DownloadButton({
  resourceId,
  storagePath,
  fileUrl,
  title,
}: {
  resourceId: string;
  storagePath: string | null;
  fileUrl: string | null;
  title: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      if (storagePath) {
        const result = await getDownloadUrl({
          data: { resourceId, storagePath },
        });

        if (result.url) {
          window.open(result.url, "_blank", "noopener,noreferrer");
        } else {
          setErrorMsg(result.error ?? "Could not generate download link.");
        }
        return;
      }

      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
        return;
      }

      setErrorMsg("Document is not yet available for download.");
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [resourceId, storagePath, fileUrl]);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        aria-label={`Download ${title}`}
        className="text-xs uppercase tracking-[0.2em] border border-current px-5 py-3 hover:bg-flame hover:text-ink hover:border-flame transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isGenerating ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Preparing…
          </>
        ) : (
          "Download PDF ↓"
        )}
      </button>
      {errorMsg && (
        <span className="text-[0.65rem] text-destructive max-w-[180px] text-right leading-relaxed">
          {errorMsg}
        </span>
      )}
    </div>
  );
}

// ─── Blog Post Card ───────────────────────────────────────────────────────────

function BlogCard({ post, index }: { post: BlogPostCard; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="border border-border bg-card hover:border-flame/50 transition-colors group overflow-hidden flex flex-col"
    >
      {/* Cover image */}
      <Link to="/knowledge-hub/blog/$slug" params={{ slug: post.slug }}>
        <div className="relative h-48 overflow-hidden bg-muted/40">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            /* Gradient placeholder when no cover image */
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-flame/10 via-background to-muted/30">
              <span className="font-display text-4xl text-flame/30 select-none">
                {post.title.charAt(0)}
              </span>
            </div>
          )}
          {post.featured && (
            <span className="absolute top-3 left-3 text-[0.6rem] uppercase tracking-[0.2em] px-2 py-0.5 bg-flame text-ink font-medium">
              ★ Featured
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 md:p-6 flex flex-col flex-1 space-y-3">
        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          {post.category && (
            <span className="text-[0.6rem] uppercase tracking-[0.2em] px-2 py-0.5 bg-flame/10 text-flame border border-flame/20">
              {post.category}
            </span>
          )}
          <span className="text-[0.65rem] text-muted-foreground">
            {formatFullDate(post.created_at)}
          </span>
          <span className="text-[0.65rem] text-muted-foreground">
            · {post.read_time_minutes} min read
          </span>
        </div>

        {/* Title */}
        <Link to="/knowledge-hub/blog/$slug" params={{ slug: post.slug }}>
          <h3 className="font-display text-xl md:text-2xl leading-tight group-hover:text-flame transition-colors">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[0.6rem] font-mono px-2 py-0.5 bg-background border border-border text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Read more */}
        <div className="pt-2 mt-auto">
          <Link
            to="/knowledge-hub/blog/$slug"
            params={{ slug: post.slug }}
            className="text-xs uppercase tracking-[0.2em] text-flame hover:underline"
          >
            Read Article →
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function KnowledgeHubPage() {
  const [activeSection, setActiveSection] = useState<"library" | "blog">("library");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Resources query
  const {
    data,
    isLoading: resourcesLoading,
    isError: resourcesError,
    error: queryError,
  } = useQuery({
    queryKey: ["knowledge-hub-resources"],
    queryFn: () => fetchPublishedResources(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Blog posts query
  const {
    data: blogData,
    isLoading: blogLoading,
    isError: blogError,
  } = useQuery({
    queryKey: ["blog-posts-public"],
    queryFn: () => fetchPublishedBlogPosts(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const resources: ResourceRow[] = (data?.resources ?? []) as ResourceRow[];
  const blogPosts: BlogPostCard[] = (blogData?.posts ?? []) as BlogPostCard[];

  // Build dynamic category list
  const categories = [
    "All",
    ...Array.from(
      new Set(
        resources
          .map((r) => r.resource_categories?.name)
          .filter(Boolean) as string[],
      ),
    ),
  ];

  const filteredResources = resources.filter((res) => {
    const catName = res.resource_categories?.name ?? "";
    const matchesCat = selectedCategory === "All" || catName === selectedCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const filteredBlog = blogPosts.filter((post) => {
    if (!searchQuery) return true;
    return (
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.category ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* ── Hero Header ── */}
        <section className="pt-36 pb-16 px-6 md:px-10 border-b border-border">
          <div className="max-w-6xl">
            <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-4">
              (06 / Knowledge Hub)
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight">
              Engineering <br />
              <span className="text-flame italic">& research library.</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl">
              Curated whitepapers, architectural blueprints, AI research notes,
              full-stack software development guides, and blog posts for engineers
              and product teams.
            </p>

            {/* Section Tabs */}
            <div className="mt-10 flex items-center gap-3">
              {[
                { id: "library", label: "Library", icon: "◈" },
                { id: "blog", label: "Blog", icon: "✦" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSection(tab.id as "library" | "blog");
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.2em] border transition-colors ${
                    activeSection === tab.id
                      ? "bg-flame text-ink border-flame font-medium"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {tab.id === "blog" && blogPosts.length > 0 && (
                    <span
                      className={`text-[0.6rem] px-1.5 py-0.5 rounded-full font-mono ${
                        activeSection === "blog"
                          ? "bg-ink/20 text-ink"
                          : "bg-flame/10 text-flame"
                      }`}
                    >
                      {blogPosts.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search & Filter row — shared */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category pills — only shown for Library */}
              <AnimatePresence mode="wait">
                {activeSection === "library" && (
                  <motion.div
                    key="cat-pills"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap items-center gap-2"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 text-xs uppercase tracking-[0.2em] border transition-colors ${
                          selectedCategory === cat
                            ? "bg-flame text-ink border-flame font-medium"
                            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                )}
                {activeSection === "blog" && (
                  <motion.div
                    key="blog-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    {filteredBlog.length} article{filteredBlog.length !== 1 ? "s" : ""}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full md:w-80">
                <input
                  type="text"
                  placeholder={activeSection === "blog" ? "Search articles..." : "Search library..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search knowledge hub"
                  className="w-full bg-card border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-flame transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Content Area ── */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <AnimatePresence mode="wait">

            {/* ─── Library Tab ─── */}
            {activeSection === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                {resourcesLoading && (
                  <>
                    <ResourceSkeleton />
                    <ResourceSkeleton />
                    <ResourceSkeleton />
                  </>
                )}

                {resourcesError && !resourcesLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 border border-destructive/40 bg-destructive/5 text-center space-y-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive text-lg mx-auto">
                      ✕
                    </div>
                    <p className="text-sm text-destructive">
                      {(queryError as Error)?.message ??
                        "Could not load the research library. Please try again."}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs uppercase tracking-[0.2em] text-flame hover:underline"
                    >
                      Reload →
                    </button>
                  </motion.div>
                )}

                {!resourcesLoading && !resourcesError && filteredResources.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 border border-border text-center space-y-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-flame text-lg mx-auto">
                      ∅
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {resources.length === 0
                        ? "No documents have been published yet. Check back soon."
                        : "No documents match your current filter or search query."}
                    </p>
                    {resources.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedCategory("All");
                          setSearchQuery("");
                        }}
                        className="text-xs uppercase tracking-[0.2em] text-flame hover:underline"
                      >
                        Clear Filters →
                      </button>
                    )}
                  </motion.div>
                )}

                <AnimatePresence mode="popLayout">
                  {!resourcesLoading &&
                    !resourcesError &&
                    filteredResources.map((res, i) => (
                      <motion.article
                        key={res.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, delay: i * 0.07 }}
                        className="border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-flame/50 transition-colors"
                      >
                        <div className="space-y-3 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-3">
                            {res.resource_categories?.name && (
                              <span className="text-[0.65rem] uppercase tracking-[0.2em] px-2.5 py-0.5 bg-flame/10 text-flame border border-flame/20">
                                {res.resource_categories.name}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(res.created_at)}
                            </span>
                            {res.featured && (
                              <span className="text-[0.6rem] uppercase tracking-[0.2em] px-2 py-0.5 bg-foreground/10 border border-border text-foreground/70">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-2xl md:text-3xl">{res.title}</h3>
                          {res.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {res.description}
                            </p>
                          )}
                          {res.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {res.tags.slice(0, 5).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[0.6rem] font-mono px-2 py-0.5 bg-background border border-border text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-6 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                          <div className="text-right hidden sm:block">
                            <span className="text-xs uppercase tracking-[0.2em] text-foreground block">
                              {res.file_type ?? "PDF"}
                            </span>
                            <span className="text-[0.7rem] text-muted-foreground">
                              {formatFileSize(res.file_size)}
                            </span>
                            <span className="text-[0.6rem] text-muted-foreground/60 block mt-0.5">
                              {res.download_count} downloads
                            </span>
                          </div>
                          <DownloadButton
                            resourceId={res.id}
                            storagePath={res.storage_path}
                            fileUrl={res.file_url}
                            title={res.title}
                          />
                        </div>
                      </motion.article>
                    ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ─── Blog Tab ─── */}
            {activeSection === "blog" && (
              <motion.div
                key="blog"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto"
              >
                {blogLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <BlogCardSkeleton />
                    <BlogCardSkeleton />
                    <BlogCardSkeleton />
                  </div>
                )}

                {blogError && !blogLoading && (
                  <div className="p-12 border border-destructive/40 bg-destructive/5 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive text-lg mx-auto">
                      ✕
                    </div>
                    <p className="text-sm text-destructive">Could not load blog posts.</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs uppercase tracking-[0.2em] text-flame hover:underline"
                    >
                      Reload →
                    </button>
                  </div>
                )}

                {!blogLoading && !blogError && filteredBlog.length === 0 && (
                  <div className="p-12 border border-border text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-flame text-lg mx-auto">
                      ∅
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {blogPosts.length === 0
                        ? "No blog posts have been published yet. Check back soon."
                        : "No articles match your search query."}
                    </p>
                    {blogPosts.length > 0 && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-xs uppercase tracking-[0.2em] text-flame hover:underline"
                      >
                        Clear Search →
                      </button>
                    )}
                  </div>
                )}

                {!blogLoading && !blogError && filteredBlog.length > 0 && (
                  <>
                    {/* Featured post — full-width first card */}
                    {filteredBlog[0]?.featured && !searchQuery && (
                      <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="border border-border bg-card hover:border-flame/50 transition-colors group overflow-hidden flex flex-col md:flex-row mb-6"
                      >
                        <Link
                          to="/knowledge-hub/blog/$slug"
                          params={{ slug: filteredBlog[0].slug }}
                          className="md:w-1/2 relative h-64 md:h-auto overflow-hidden bg-muted/40 block"
                        >
                          {filteredBlog[0].cover_image_url ? (
                            <img
                              src={filteredBlog[0].cover_image_url}
                              alt={filteredBlog[0].title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-flame/10 via-background to-muted/30">
                              <span className="font-display text-6xl text-flame/30">
                                {filteredBlog[0].title.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="absolute top-3 left-3 text-[0.6rem] uppercase tracking-[0.2em] px-2 py-0.5 bg-flame text-ink font-medium">
                            ★ Featured
                          </span>
                        </Link>
                        <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center space-y-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {filteredBlog[0].category && (
                              <span className="text-[0.6rem] uppercase tracking-[0.2em] px-2 py-0.5 bg-flame/10 text-flame border border-flame/20">
                                {filteredBlog[0].category}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatFullDate(filteredBlog[0].created_at)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              · {filteredBlog[0].read_time_minutes} min read
                            </span>
                          </div>
                          <Link to="/knowledge-hub/blog/$slug" params={{ slug: filteredBlog[0].slug }}>
                            <h2 className="font-display text-3xl md:text-4xl leading-tight group-hover:text-flame transition-colors">
                              {filteredBlog[0].title}
                            </h2>
                          </Link>
                          {filteredBlog[0].excerpt && (
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                              {filteredBlog[0].excerpt}
                            </p>
                          )}
                          {filteredBlog[0].tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {filteredBlog[0].tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[0.6rem] font-mono px-2 py-0.5 bg-background border border-border text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <Link
                            to="/knowledge-hub/blog/$slug"
                            params={{ slug: filteredBlog[0].slug }}
                            className="text-xs uppercase tracking-[0.2em] text-flame hover:underline mt-2 inline-block"
                          >
                            Read Article →
                          </Link>
                        </div>
                      </motion.article>
                    )}

                    {/* Grid of remaining posts */}
                    <AnimatePresence mode="popLayout">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(filteredBlog[0]?.featured && !searchQuery
                          ? filteredBlog.slice(1)
                          : filteredBlog
                        ).map((post, i) => (
                          <BlogCard key={post.id} post={post} index={i} />
                        ))}
                      </div>
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── CTA Banner ── */}
        {!resourcesLoading && !resourcesError && activeSection === "library" && (
          <section className="px-6 md:px-10 pb-16 md:pb-24">
            <div className="max-w-6xl mx-auto border border-border bg-card p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-2">
                  AI Lab
                </span>
                <h2 className="font-display text-3xl md:text-4xl">
                  Chat with any document.
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-lg">
                  Use the AI PDF Chat Studio in the AI Lab to ask natural language questions
                  about any research paper with exact page citations.
                </p>
              </div>
              <a
                href="/ai-lab"
                className="shrink-0 text-xs uppercase tracking-[0.2em] bg-flame text-ink px-8 py-4 font-medium hover:bg-flame/90 transition-colors"
              >
                Open AI Lab →
              </a>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}
