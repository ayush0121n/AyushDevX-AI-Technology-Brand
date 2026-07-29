import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — About Our AI & Technology Brand" },
      {
        name: "description",
        content:
          "Learn about AyushDevX — a professional AI product studio building intelligent digital experiences with open-source AI and full-stack engineering.",
      },
    ],
  }),
});

const coreAreas = [
  {
    n: "01",
    title: "Artificial Intelligence & ML",
    desc: "Production deep learning vision pipelines, PyTorch/TensorFlow models, and statistical evaluation.",
  },
  {
    n: "02",
    title: "Generative AI & RAG",
    desc: "Hybrid vector search with PostgreSQL pgvector, local embeddings, and zero-hallucination reference retrieval.",
  },
  {
    n: "03",
    title: "AI Agents & Automation",
    desc: "Autonomous software development agents, task pipelines, and developer workflow automation.",
  },
  {
    n: "04",
    title: "Full-Stack Engineering",
    desc: "High-performance React 19, TanStack Start, and Node.js applications with strong TypeScript typing.",
  },
  {
    n: "05",
    title: "Database Architecture",
    desc: "Supabase PostgreSQL with migrations, declarative schemas, and strict Row Level Security (RLS).",
  },
  {
    n: "06",
    title: "Digital Products & Tools",
    desc: "Accessible developer utilities, AI web applications, and interactive technical documentation.",
  },
];

const brandPrinciples = [
  {
    title: "Build Production-Quality Software",
    desc: "We engineer systems intended for real users, respecting rate limits, timeouts, and edge cases.",
  },
  {
    title: "Prioritize Simple Architecture",
    desc: "We avoid unnecessary microservices or complex abstractions in favor of clean, maintainable modular monoliths.",
  },
  {
    title: "Open-Source & Free Infrastructure",
    desc: "We design AI capabilities around open-source models, browser-based inference, and accessible cloud tiers.",
  },
  {
    title: "Uncompromising Security & Privacy",
    desc: "We enforce server-side Row Level Security, validate all uploads, and never expose sensitive credentials.",
  },
];

function AboutPage() {
  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Hero Header */}
        <section className="pt-36 pb-16 px-6 md:px-10 border-b border-border">
          <div className="max-w-6xl">
            <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-4">
              (03 / About AyushDevX)
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight">
              AI product studio <br />
              <span className="text-flame italic">& technology brand.</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              AyushDevX is a professional technology brand dedicated to building
              intelligent applications, AI-powered tools, software products, and
              digital experiences that scale.
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="px-6 md:px-10 py-16 md:py-24 border-b border-border">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-3">
                Our Positioning
              </span>
              <h2 className="font-display text-3xl md:text-5xl leading-tight">
                Where artificial intelligence meets{" "}
                <span className="text-flame italic">real engineering.</span>
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-muted-foreground leading-relaxed">
              <p>
                In an era dominated by superficial AI wrappers and unverified
                claims, AyushDevX stands for technical substance and engineered
                reliability. We combine modern full-stack web architecture with
                open-source artificial intelligence to build software that works.
              </p>
              <p>
                Whether designing retrieval-augmented generation (RAG) engines
                for document discovery, computer vision models for clinical
                screening, or interactive developer utilities, every project
                under the AyushDevX umbrella is built to answer three simple
                questions:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-foreground font-display text-lg">
                <div className="p-4 border border-border bg-card">
                  <span className="text-flame block text-xs uppercase tracking-widest mb-1">
                    01
                  </span>
                  Why does this exist?
                </div>
                <div className="p-4 border border-border bg-card">
                  <span className="text-flame block text-xs uppercase tracking-widest mb-1">
                    02
                  </span>
                  What problem does it solve?
                </div>
                <div className="p-4 border border-border bg-card">
                  <span className="text-flame block text-xs uppercase tracking-widest mb-1">
                    03
                  </span>
                  What value does it provide?
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Areas Grid */}
        <section className="px-6 md:px-10 py-16 md:py-24 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-2">
                  Technical Scope
                </span>
                <h2 className="font-display text-4xl md:text-6xl">
                  Core capabilities.
                </h2>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground hidden md:block">
                AyushDevX Architecture
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
              {coreAreas.map((area, i) => (
                <motion.div
                  key={area.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-background p-8 min-h-[220px] flex flex-col justify-between"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-flame">
                    {area.n}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl">{area.title}</h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {area.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Engineering Philosophy */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-3">
              Engineering Principles
            </span>
            <h2 className="font-display text-4xl md:text-6xl mb-12">
              How we <span className="text-flame italic">build.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {brandPrinciples.map((principle, i) => (
                <div
                  key={principle.title}
                  className="p-8 border border-border bg-card flex flex-col justify-between space-y-4"
                >
                  <span className="text-xs font-mono text-muted-foreground">
                    Principle 0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl">{principle.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {principle.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
