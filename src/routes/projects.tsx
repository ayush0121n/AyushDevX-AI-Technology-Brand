import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Magnetic } from "@/components/site/Magnetic";
import { profile } from "@/data/profile";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      {
        title: `${profile.brandName} — Engineered Systems & Production Projects`,
      },
      {
        name: "description",
        content:
          "Explore production-grade deep learning systems, full-stack MERN platforms, and agentic RAG pipelines built by AyushDevX.",
      },
    ],
  }),
});

const filterCategories = [
  "All",
  "AI / ML",
  "Full-Stack",
  "Open-Source",
] as const;

function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filteredProjects = profile.projects.filter((project) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Open-Source")
      return Boolean(project.githubUrl);
    return project.category === activeFilter;
  });

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Hero Header */}
        <section className="pt-36 pb-16 px-6 md:px-10 border-b border-border">
          <div className="max-w-6xl">
            <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-4">
              (02 / Engineered Systems)
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight">
              Production <br />
              <span className="text-flame italic">& research systems.</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl">
              Verified deep learning vision pipelines, MERN full-stack digital
              products, real-time developer platforms, and agentic RAG
              extraction architectures.
            </p>

            {/* Filter Tabs */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-5 py-2.5 text-xs uppercase tracking-[0.2em] border transition-colors ${
                    activeFilter === cat
                      ? "bg-flame text-ink border-flame font-medium"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid / Case Studies */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-6xl mx-auto space-y-16">
            <AnimatePresence mode="wait">
              {filteredProjects.map((project, idx) => (
                <motion.article
                  key={project.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="border border-border bg-card p-8 md:p-12 space-y-8 relative overflow-hidden"
                >
                  {/* Top Badge Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 bg-flame/15 text-flame border border-flame/30 font-semibold">
                        {project.category}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        Year: {project.year}
                      </span>
                    </div>

                    {project.githubUrl && (
                      <Magnetic strength={0.25}>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs uppercase tracking-[0.2em] border border-border px-5 py-2.5 text-foreground hover:border-flame hover:text-flame transition-colors inline-block"
                        >
                          View Source (GitHub) ↗
                        </a>
                      </Magnetic>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h2 className="font-display text-3xl md:text-5xl leading-tight">
                      {project.title}
                    </h2>
                    <p className="text-base md:text-lg text-flame mt-2">
                      {project.subtitle}
                    </p>
                  </div>

                  {/* Description & Details */}
                  <div className="space-y-4 text-muted-foreground leading-relaxed max-w-4xl">
                    <p className="text-foreground/90 font-medium text-base">
                      {project.description}
                    </p>
                    <p className="text-sm md:text-base">{project.details}</p>
                  </div>

                  {/* Highlights Grid */}
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-3">
                      Key Technical Highlights
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {project.highlights.map((h) => (
                        <div
                          key={h}
                          className="p-3 bg-background border border-border text-xs md:text-sm text-foreground/90 flex items-center gap-2"
                        >
                          <span className="text-flame font-bold">✓</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs font-mono px-3 py-1 bg-muted border border-border text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Medical / Research Disclaimers */}
                    {"disclaimer" in project && project.disclaimer && (
                      <p className="text-xs text-amber-500/90 italic max-w-xl">
                        Disclaimer: {project.disclaimer}
                      </p>
                    )}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
