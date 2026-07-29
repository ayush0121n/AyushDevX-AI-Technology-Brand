import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Magnetic } from "@/components/site/Magnetic";

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
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  tags: string[];
}

const articles: InsightArticle[] = [
  {
    id: "why-modular-monoliths",
    title:
      "Why We Built AyushDevX as a Modular Monolith Instead of Microservices",
    category: "Architecture",
    date: "July 2026",
    readTime: "7 min read",
    summary:
      "A candid look at why early-stage technology brands and AI product studios should avoid premature microservice fragmentation in favor of clean TypeScript modular monoliths.",
    tags: ["Architecture", "TypeScript", "TanStack Start", "System Design"],
  },
  {
    id: "rag-pgvector-supabase",
    title:
      "Deploying Zero-Hallucination RAG with Supabase PostgreSQL and pgvector",
    category: "AI / ML",
    date: "June 2026",
    readTime: "9 min read",
    summary:
      "How to implement vector similarity search, cosine distance indexes, and strict Row Level Security policies for enterprise-grade conversational AI assistants.",
    tags: ["RAG", "PostgreSQL", "pgvector", "Supabase", "LLMs"],
  },
  {
    id: "oklch-color-design-tokens",
    title:
      "Designing Premium Dark-First Web Interfaces with OKLCH Color Tokens",
    category: "Design Systems",
    date: "May 2026",
    readTime: "5 min read",
    summary:
      "Leveraging Tailwind CSS v4 and modern OKLCH color spaces to engineer vibrant flame accents, deep ink backgrounds, and accessible contrast ratios.",
    tags: ["UI/UX", "Tailwind v4", "OKLCH", "Design Systems"],
  },
];

function InsightsPage() {
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
            {articles.map((art, i) => (
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
                    {art.date} · {art.readTime}
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
                    {art.tags.map((tag) => (
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
                          `Article: "${art.title}" — Full markdown reader will be available in Phase 5 blog reader update.`,
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
