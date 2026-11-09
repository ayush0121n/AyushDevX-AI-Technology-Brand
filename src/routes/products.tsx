import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Magnetic } from "@/components/site/Magnetic";
import { useProducts, ProductItem } from "@/data/productsData";
import { Sparkles, ArrowRight, ExternalLink, Code2 } from "lucide-react";

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

function ProductsPage() {
  const { products } = useProducts();
  const [filter, setFilter] = useState<"all" | "published" | "coming_soon">("all");

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.status === filter);

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Hero Header */}
        <section className="pt-36 pb-16 px-6 md:px-10 border-b border-border">
          <div className="max-w-6xl">
            <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-4">
              (02 / Products & Solutions)
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight">
              Interactive <br />
              <span className="text-flame italic">AI Lab tools & products.</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl font-sans">
              Live interactive AI tools and product studio applications powered by Groq LLM and vector RAG — including our Portfolio Assistant, PDF Document Chat, ATS Resume Matcher, and No-Code Data Analyst.
            </p>

            {/* Status Filter */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
              {[
                { key: "all", label: "All Products" },
                { key: "published", label: "Available Now" },
                { key: "coming_soon", label: "Roadmap / In Progress" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as "all" | "published" | "coming_soon")}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.2em] font-mono border transition-colors ${
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
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="border border-border bg-card p-8 flex flex-col justify-between hover:border-flame/50 transition-all duration-300 relative group"
                >
                  <div>
                    {/* Header: Badge & Status */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 bg-flame/15 text-flame border border-flame/30 font-semibold tracking-wider">
                        {product.badge}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                        {product.status === "published" ? (
                          <span className="text-emerald-500 font-medium">● Available</span>
                        ) : (
                          <span className="text-amber-500 font-medium">◌ Coming Soon</span>
                        )}
                      </span>
                    </div>

                    <h2 className="font-display text-2xl md:text-3xl leading-snug group-hover:text-flame transition-colors">
                      {product.name}
                    </h2>
                    <p className="text-xs md:text-sm text-flame mt-1 font-mono">
                      {product.tagline}
                    </p>

                    <p className="mt-4 text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>

                    {/* Features List */}
                    <div className="mt-6 space-y-2 border-t border-border/60 pt-4">
                      {product.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 text-xs text-foreground/80 font-sans"
                        >
                          <span className="text-flame font-bold font-mono">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-8 pt-5 border-t border-border flex items-center justify-between gap-4">
                    {product.githubUrl && (
                      <a
                        href={product.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                      >
                        <Code2 className="size-3.5" />
                        <span>Source</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}

                    {product.demoUrl ? (
                      <Magnetic strength={0.2}>
                        <Link
                          to={product.demoUrl}
                          className="px-4 py-2 bg-flame text-ink text-xs font-mono uppercase tracking-wider font-semibold hover:bg-flame/90 transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>Launch Product</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </Magnetic>
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground/60 italic">
                        Preview on request
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
