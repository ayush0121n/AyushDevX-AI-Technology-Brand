import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Magnetic } from "@/components/site/Magnetic";
import { useQuery } from "@tanstack/react-query";
import { fetchPublishedInsights } from "@/api/insights";

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — Technical Insights & Articles" },
      {
        name: "description",
        content:
          "Read engineering articles, AI research notes, and architectural deep-dives from the AyushDevX product studio.",
      },
    ],
  }),
});

interface InsightArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  published_date: string;
  read_time: string;
  summary: string;
  tags: string[];
  featured: boolean;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

function InsightsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["insights-articles"],
    queryFn: () => fetchPublishedInsights(),
    staleTime: 5 * 60 * 1000,
  });

  const articles: InsightArticle[] = (data?.insights ?? []) as InsightArticle[];

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Hero Header */}
        <section className="pt-36 pb-16 px-6 md:px-10 border-b border-border">
          <div className="max-w-6xl">
            <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-4">
              (07 / Technical Insights)
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight">
              Engineering <br />
              <span className="text-flame italic">articles & research.</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl">
              In-depth articles exploring software architecture, generative AI,
              retrieval-augmented generation, and modern full-stack development.
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-6xl mx-auto space-y-12">
            {isLoading && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-border bg-card p-8 md:p-12 space-y-6 animate-pulse">
                    <div className="h-6 w-32 bg-muted rounded-sm" />
                    <div className="h-10 w-3/4 bg-muted rounded-sm" />
                    <div className="h-16 w-full bg-muted/60 rounded-sm" />
                  </div>
                ))}
              </div>
            )}

            {isError && !isLoading && (
              <div className="p-12 border border-destructive/40 bg-destructive/5 text-center space-y-3">
                <p className="text-sm text-destructive">
                  {(error as Error)?.message ?? "Could not load insights."}
                </p>
              </div>
            )}

            {!isLoading && !isError && articles.length === 0 && (
              <div className="p-12 border border-border text-center">
                <p className="text-sm text-muted-foreground">No articles found.</p>
              </div>
            )}

            {!isLoading && !isError && articles.map((art, i) => (
              <motion.article
                key={art.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border border-border bg-card p-8 md:p-12 space-y-6 hover:border-flame/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] px-3 py-1 bg-flame/10 text-flame border border-flame/20">
                    {art.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(art.published_date)} · {art.read_time}
                  </span>
                </div>

                <h2 className="font-display text-3xl md:text-5xl leading-tight">
                  {art.title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-4xl">
                  {art.summary}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    {art.tags && art.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 bg-muted text-muted-foreground border border-border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Magnetic strength={0.3}>
                    <button
                      onClick={() =>
                        alert(
                          `Article: "${art.title}" — Full markdown reader will be available in Phase 5 blog reader update.`
                        )
                      }
                      className="text-xs uppercase tracking-[0.2em] text-flame hover:underline font-medium"
                    >
                      Read Full Article →
                    </button>
                  </Magnetic>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
