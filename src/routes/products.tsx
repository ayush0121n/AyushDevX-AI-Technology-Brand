import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Magnetic } from "@/components/site/Magnetic";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — Digital Products & AI Tools" },
      {
        name: "description",
        content:
          "Discover intelligent AI tools, RAG pipelines, developer utilities, and software products built by AyushDevX.",
      },
    ],
  }),
});

interface ProductItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  status: "published" | "coming_soon" | "draft";
  badge: string;
  demoUrl?: string;
}

const products: ProductItem[] = [
  {
    id: "ai-portfolio-assistant",
    name: "AI Portfolio Assistant",
    tagline: "RAG-Powered Conversational Knowledge Engine",
    description:
      "Interactive AI assistant trained on AyushDevX documentation, engineering specifications, and technical projects.",
    features: [
      "Retrieval-Augmented Generation (RAG)",
      "Zero hallucination fallback to verified docs",
      "Real-time streaming token responses",
      "Contextual source citations",
    ],
    status: "published",
    badge: "Live Beta",
    demoUrl: "/ai-lab",
  },
  {
    id: "ai-pdf-chat",
    name: "AI PDF Chat & RAG Studio",
    tagline: "Chat with Technical PDF Documents & Research Papers",
    description:
      "Upload PDF research papers, technical specs, or manuals and ask natural language questions with exact page references.",
    features: [
      "Client-side PDF text extraction",
      "Local vector similarity search",
      "Page number citations",
      "Privacy-first file handling",
    ],
    status: "coming_soon",
    badge: "In Development",
  },
  {
    id: "ai-resume-analyzer",
    name: "AI Resume & ATS Analyzer",
    tagline: "Intelligent Job Fit & Keyword Optimization Engine",
    description:
      "Compare resumes against job descriptions to evaluate ATS compatibility, uncover skill gaps, and receive actionable rewrites.",
    features: [
      "ATS keyword match scoring",
      "Skill gap identification",
      "Action verb optimization",
      "Custom cover letter draft generation",
    ],
    status: "coming_soon",
    badge: "Planned Q2",
  },
  {
    id: "ai-data-analyst",
    name: "AI Data Analyst Studio",
    tagline: "Natural Language EDA for CSV Datasets",
    description:
      "Upload tabular CSV datasets and explore statistical distributions, outliers, and charts using plain English prompts.",
    features: [
      "Automated Exploratory Data Analysis",
      "Instant statistical summaries",
      "Data quality audit reports",
      "No-code SQL query generation",
    ],
    status: "coming_soon",
    badge: "Planned Q3",
  },
  {
    id: "ai-code-reviewer",
    name: "AI Code Reviewer",
    tagline: "Automated Security & Performance Code Analysis",
    description:
      "Analyze TypeScript and Python code snippets for anti-patterns, security risks, and Supabase PostgreSQL best practices.",
    features: [
      "PostgreSQL & RLS security check",
      "TypeScript type safety audit",
      "Performance optimization tips",
      "Clean code refactor suggestions",
    ],
    status: "coming_soon",
    badge: "Planned Q3",
  },
  {
    id: "ai-interview-simulator",
    name: "AI Interview Simulator",
    tagline: "Interactive Technical & Architectural Interviewer",
    description:
      "Practice full-stack, machine learning, and system design interviews with real-time feedback on clarity and depth.",
    features: [
      "System design scenarios",
      "Machine learning theory probes",
      "Real-time communication scoring",
      "Actionable improvement feedback",
    ],
    status: "coming_soon",
    badge: "Planned Q4",
  },
];

function ProductsPage() {
  const [filter, setFilter] = useState<"all" | "published" | "coming_soon">(
    "all",
  );

  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((p) => p.status === filter);

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Hero Header */}
        <section className="pt-36 pb-16 px-6 md:px-10 border-b border-border">
          <div className="max-w-6xl">
            <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-4">
              (02 / Products)
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight">
              Intelligent <br />
              <span className="text-flame italic">AI tools & studio.</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl">
              Production-grade AI tools, RAG knowledge engines, and developer
              products engineered for speed, accuracy, and accessibility.
            </p>

            {/* Status Filter */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
              {[
                { key: "all", label: "All Products" },
                { key: "published", label: "Available Now" },
                { key: "coming_soon", label: "Roadmap / Coming Soon" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() =>
                    setFilter(tab.key as "all" | "published" | "coming_soon")
                  }
                  className={`px-4 py-2 text-xs uppercase tracking-[0.2em] border transition-colors ${
                    filter === tab.key
                      ? "bg-flame text-ink border-flame font-medium"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProducts.map((product, i) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border border-border bg-card p-8 md:p-10 flex flex-col justify-between space-y-8 hover:border-flame/50 transition-colors"
              >
                <div>
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`text-[0.65rem] uppercase tracking-[0.2em] px-3 py-1 border ${
                        product.status === "published"
                          ? "bg-flame text-ink border-flame font-medium"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {product.badge}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      AyushDevX<sup>®</sup>
                    </span>
                  </div>

                  <h2 className="font-display text-3xl md:text-4xl">
                    {product.name}
                  </h2>
                  <p className="mt-2 text-xs uppercase tracking-[0.15em] text-flame font-medium">
                    {product.tagline}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="mt-6 space-y-2 border-t border-border pt-6">
                    {product.features.map((feat) => (
                      <li
                        key={feat}
                        className="text-xs text-foreground/85 flex items-center gap-2.5"
                      >
                        <span className="text-flame">✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA / Action */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  {product.status === "published" && product.demoUrl ? (
                    <Magnetic strength={0.3}>
                      <a
                        href={product.demoUrl}
                        className="text-xs uppercase tracking-[0.2em] bg-flame text-ink px-6 py-3 inline-block font-medium hover:bg-flame/90 transition-colors"
                      >
                        Launch Tool →
                      </a>
                    </Magnetic>
                  ) : (
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground italic">
                      Coming Soon to AI Lab
                    </span>
                  )}
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                    Free Tier Available
                  </span>
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
