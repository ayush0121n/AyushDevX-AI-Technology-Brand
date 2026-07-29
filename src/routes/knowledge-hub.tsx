import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/knowledge-hub")({
  component: KnowledgeHubPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — Knowledge Hub & Research Library" },
      {
        name: "description",
        content:
          "Access curated engineering whitepapers, AI research guides, architectural blueprints, and full-stack documentation by AyushDevX.",
      },
    ],
  }),
});

interface ResourceItem {
  id: string;
  title: string;
  category: string;
  desc: string;
  date: string;
  format: string;
  size: string;
}

const resources: ResourceItem[] = [
  {
    id: "rag-architecture-guide",
    title: "Production RAG Architecture & Vector Database Sizing",
    category: "AI & Machine Learning",
    desc: "A practical guide to designing zero-hallucination Retrieval-Augmented Generation pipelines using PostgreSQL pgvector and local embeddings.",
    date: "July 2026",
    format: "PDF Whitepaper",
    size: "2.4 MB",
  },
  {
    id: "modular-monolith-patterns",
    title: "Why We Prefer Modular Monoliths Over Microservices",
    category: "Full-Stack Architecture",
    desc: "An architectural deep dive into balancing scalability and simplicity with TanStack Start, React 19, and Supabase PostgreSQL.",
    date: "June 2026",
    format: "Engineering Brief",
    size: "1.8 MB",
  },
  {
    id: "supabase-rls-security-guide",
    title: "Supabase PostgreSQL Row Level Security (RLS) Best Practices",
    category: "Database & Security",
    desc: "Complete checklist for auditing policies, preventing privilege escalation, and testing secure database mutations.",
    date: "May 2026",
    format: "PDF Guide",
    size: "3.1 MB",
  },
  {
    id: "cnn-blood-smear-microscopy",
    title: "Deep Learning Vision for Automated Malaria Screening",
    category: "AI & Machine Learning",
    desc: "Research report on training and validating custom Convolutional Neural Networks on 27,558 microscopy cell images.",
    date: "April 2026",
    format: "Research Report",
    size: "4.5 MB",
  },
];

const allCategories = [
  "All",
  "AI & Machine Learning",
  "Full-Stack Architecture",
  "Database & Security",
] as const;

function KnowledgeHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredResources = resources.filter((res) => {
    const matchesCat =
      selectedCategory === "All" || res.category === selectedCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Hero Header */}
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
              and full-stack software development guides for engineers and
              product teams.
            </p>

            {/* Search & Category Bar */}
            <div className="mt-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-2">
                {allCategories.map((cat) => (
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
              </div>

              <div className="w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-flame transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-6xl mx-auto space-y-6">
            {filteredResources.length === 0 ? (
              <div className="p-12 border border-border text-center text-muted-foreground text-sm">
                No matching documents found in the research library.
              </div>
            ) : (
              filteredResources.map((res, i) => (
                <motion.article
                  key={res.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-flame/50 transition-colors"
                >
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex items-center gap-3">
                      <span className="text-[0.65rem] uppercase tracking-[0.2em] px-2.5 py-0.5 bg-flame/10 text-flame border border-flame/20">
                        {res.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {res.date}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl">
                      {res.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {res.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs uppercase tracking-[0.2em] text-foreground block">
                        {res.format}
                      </span>
                      <span className="text-[0.7rem] text-muted-foreground">
                        {res.size}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        alert(
                          `Research Document: "${res.title}" will be downloadable once Supabase PDF storage bucket is connected in production.`,
                        )
                      }
                      className="text-xs uppercase tracking-[0.2em] border border-current px-5 py-3 hover:bg-flame hover:text-ink hover:border-flame transition-colors font-medium"
                    >
                      Download PDF ↓
                    </button>
                  </div>
                </motion.article>
              ))
            )}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
