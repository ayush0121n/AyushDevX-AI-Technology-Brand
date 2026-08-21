import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { fetchBlogPostBySlug } from "@/api/blog";

export const Route = createFileRoute("/knowledge-hub/blog/$slug")({
  component: BlogPostPage,
  head: ({ params }) => ({
    meta: [
      { title: `AyushDevX — Blog` },
      { name: "description", content: "Read the latest insights and notes from AyushDevX." },
    ],
  }),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_image_url: string | null;
  cover_image_path: string | null;
  pdf_path: string | null;
  pdf_url: string | null;
  pdf_title: string | null;
  tags: string[];
  category: string | null;
  featured: boolean;
  read_time_minutes: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Very lightweight markdown renderer — handles headings, bold, italic,
 * inline code, fenced code blocks, blockquotes, unordered/ordered lists,
 * horizontal rules, and paragraphs. No external dependency needed.
 */
function renderMarkdown(md: string): string {
  let html = md
    // Escape existing HTML to avoid XSS
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Fenced code blocks (``` ... ```)
  html = html.replace(
    /```([^\n]*)\n([\s\S]*?)```/g,
    (_, lang, code) =>
      `<pre class="blog-code-block"><code class="language-${lang.trim() || "text"}">${code.trim()}</code></pre>`,
  );

  // Headings
  html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");

  // Horizontal rules
  html = html.replace(/^(---|\*\*\*|___)$/gm, "<hr />");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Unordered lists
  html = html.replace(/^[\-\*\+] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Images: ![alt](url)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="blog-image" loading="lazy" />',
  );

  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="blog-link">$1</a>',
  );

  // Paragraphs — wrap lines not already wrapped in block elements
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (/^<(h[1-6]|ul|ol|li|pre|blockquote|hr|img)/.test(block)) return block;
      return `<p>${block.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}

// ─── Blog Post Page ───────────────────────────────────────────────────────────

function BlogPostPage() {
  const { slug } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchBlogPostBySlug(slug),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const post = data?.post as BlogPost | null;

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <span className="w-8 h-8 border-2 border-flame border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Error / Not Found ── */}
        {(isError || (!isLoading && !post)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto px-6 py-40 text-center space-y-4"
          >
            <p className="text-4xl font-display">Post not found.</p>
            <p className="text-sm text-muted-foreground">
              This article may have been removed or is not yet published.
            </p>
            <Link
              to="/knowledge-hub"
              className="text-xs uppercase tracking-[0.2em] text-flame hover:underline"
            >
              ← Back to Knowledge Hub
            </Link>
          </motion.div>
        )}

        {/* ── Post ── */}
        {!isLoading && post && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Cover Image */}
            {post.cover_image_url && (
              <div className="w-full h-[50vh] overflow-hidden relative">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              </div>
            )}

            {/* Header */}
            <header
              className={`px-6 md:px-10 max-w-4xl mx-auto ${
                post.cover_image_url ? "-mt-24 relative z-10" : "pt-36"
              } pb-8`}
            >
              {/* Back link */}
              <Link
                to="/knowledge-hub"
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-flame transition-colors inline-flex items-center gap-1 mb-8 block"
              >
                ← Knowledge Hub
              </Link>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {post.category && (
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] px-2.5 py-0.5 bg-flame/10 text-flame border border-flame/20">
                    {post.category}
                  </span>
                )}
                {post.featured && (
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] px-2 py-0.5 bg-foreground/10 border border-border text-foreground/70">
                    ★ Featured
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDate(post.created_at)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {post.read_time_minutes} min read
                </span>
                <span className="text-xs text-muted-foreground">
                  {post.view_count} views
                </span>
              </div>

              <h1 className="font-display text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] tracking-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {post.excerpt}
                </p>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.6rem] font-mono px-2 py-0.5 bg-background border border-border text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8 border-t border-border" />
            </header>

            {/* Body */}
            <article className="px-6 md:px-10 max-w-4xl mx-auto py-8">
              <div
                className="blog-body"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
              />
            </article>

            {/* Attached PDF */}
            {post.pdf_url && (
              <div className="px-6 md:px-10 max-w-4xl mx-auto pb-12">
                <div className="border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-[0.25em] text-flame block">
                      Attached Document
                    </span>
                    <p className="font-display text-xl">
                      {post.pdf_title ?? "Download PDF"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Companion reading material for this post.
                    </p>
                  </div>
                  <a
                    href={post.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs uppercase tracking-[0.2em] border border-current px-6 py-3 hover:bg-flame hover:text-ink hover:border-flame transition-colors"
                  >
                    Download PDF ↓
                  </a>
                </div>
              </div>
            )}

            {/* Bottom nav */}
            <div className="px-6 md:px-10 max-w-4xl mx-auto pb-20 border-t border-border pt-8">
              <Link
                to="/knowledge-hub"
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-flame transition-colors inline-flex items-center gap-1"
              >
                ← Back to Knowledge Hub
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Blog body styles */}
      <style>{`
        .blog-body { line-height: 1.8; font-size: 1.0625rem; color: hsl(var(--foreground)); }
        .blog-body h1,.blog-body h2,.blog-body h3,.blog-body h4,.blog-body h5,.blog-body h6 {
          font-family: var(--font-display, serif);
          font-weight: 600;
          letter-spacing: -0.02em;
          margin: 2em 0 0.75em;
          line-height: 1.2;
          color: hsl(var(--foreground));
        }
        .blog-body h1 { font-size: 2.2rem; }
        .blog-body h2 { font-size: 1.7rem; border-bottom: 1px solid hsl(var(--border)); padding-bottom: 0.4em; }
        .blog-body h3 { font-size: 1.3rem; }
        .blog-body h4 { font-size: 1.1rem; }
        .blog-body p { margin: 0 0 1.4em; }
        .blog-body strong { font-weight: 700; color: hsl(var(--foreground)); }
        .blog-body em { font-style: italic; }
        .blog-body code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875em;
          background: hsl(var(--muted));
          color: hsl(var(--flame, 28 100% 55%));
          padding: 0.15em 0.4em;
          border-radius: 3px;
        }
        .blog-code-block {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 4px;
          padding: 1.25rem 1.5rem;
          overflow-x: auto;
          margin: 1.5em 0;
          font-size: 0.875rem;
          line-height: 1.7;
        }
        .blog-code-block code {
          background: none;
          color: hsl(var(--foreground));
          padding: 0;
          font-size: inherit;
        }
        .blog-body blockquote {
          border-left: 3px solid hsl(var(--flame, 28 100% 55%));
          padding-left: 1.25rem;
          margin: 1.5em 0;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        .blog-body ul, .blog-body ol { padding-left: 1.5rem; margin: 0 0 1.4em; }
        .blog-body li { margin-bottom: 0.4em; }
        .blog-body hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 2.5em 0; }
        .blog-image {
          width: 100%;
          border-radius: 4px;
          border: 1px solid hsl(var(--border));
          margin: 1.5em 0;
          max-height: 600px;
          object-fit: cover;
        }
        .blog-link {
          color: hsl(var(--flame, 28 100% 55%));
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .blog-link:hover { opacity: 0.8; }
      `}</style>

      <Footer />
    </main>
  );
}
