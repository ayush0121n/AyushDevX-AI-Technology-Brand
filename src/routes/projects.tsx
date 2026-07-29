import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Magnetic } from "@/components/site/Magnetic";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — Production Projects & Systems" },
      {
        name: "description",
        content:
          "Explore production AI/ML models, deep learning systems, and full-stack software applications engineered by AyushDevX.",
      },
    ],
  }),
});

interface ProjectItem {
  id: string;
  title: string;
  category: "AI / ML" | "Full-Stack" | "Open-Source";
  description: string;
  problem: string;
  solution: string;
  metrics: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  status: "Production" | "Open Source";
}

const allProjects: ProjectItem[] = [
  {
    id: "malariascope",
    title: "MalariaScope CNN",
    category: "AI / ML",
    description:
      "Deep learning computer vision system for automated malaria detection from thin blood smear microscopy images.",
    problem:
      "Manual microscopy diagnosis is slow and prone to inter-observer variability in clinical screening.",
    solution:
      "Custom Convolutional Neural Network trained and validated on 27,558 NIH cell images with transfer learning support.",
    metrics: "93% validation accuracy · 0.97 ROC-AUC score",
    technologies: ["Python", "TensorFlow", "Keras", "OpenCV", "Flask"],
    githubUrl: "https://github.com/ayush0121n/malaria-detection",
    status: "Open Source",
  },
  {
    id: "estatexai",
    title: "EstateXAI Platform",
    category: "Full-Stack",
    description:
      "Intelligent real estate and accommodation discovery platform with geospatial filtering and role-based access control.",
    problem:
      "Fragmented accommodation search tools lack verified listings and responsive interactive filtering.",
    solution:
      "Full-stack MERN application featuring 9 secure REST endpoints, JWT authentication, and interactive property mapping.",
    metrics: "< 100ms API response time · Role-based security",
    technologies: ["React", "Node.js", "Express", "MongoDB", "JWT", "Tailwind"],
    demoUrl: "https://estate-xai.vercel.app",
    status: "Production",
  },
  {
    id: "proconnect",
    title: "ProConnect Messaging",
    category: "Full-Stack",
    description:
      "Real-time professional networking and communication suite built with atomic design principles.",
    problem:
      "Conventional networking platforms suffer from sluggish real-time messaging and bloated UI bundles.",
    solution:
      "Engineered with React 19, TypeScript, and Socket.IO for low-latency bidirectional messaging and modular components.",
    metrics: "Real-time WebSockets · 20+ atomic UI components",
    technologies: ["React 19", "TypeScript", "Socket.IO", "Tailwind CSS", "Vite"],
    githubUrl: "https://github.com/ayush0121n/ai",
    status: "Open Source",
  },
  {
    id: "rag-engine",
    title: "AyushDevX RAG Engine",
    category: "AI / ML",
    description:
      "Retrieval-Augmented Generation pipeline for contextual document analysis and intelligent query resolution.",
    problem:
      "Generic LLMs hallucinate domain-specific answers without verified reference documents.",
    solution:
      "Hybrid vector search architecture integrating embeddings with local PostgreSQL pgvector and streaming responses.",
    metrics: "Zero hallucination fallback · Verified citations",
    technologies: ["TypeScript", "PostgreSQL", "pgvector", "LLM APIs", "RAG"],
    status: "Production",
  },
];

const categories = ["All", "AI / ML", "Full-Stack", "Open-Source"] as const;

function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredProjects =
    selectedCategory === "All"
      ? allProjects
      : allProjects.filter((p) => p.category === selectedCategory);

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Hero Header */}
        <section className="pt-36 pb-16 px-6 md:px-10 border-b border-border">
          <div className="max-w-6xl">
            <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-4">
              (01 / Projects)
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight">
              Production <br />
              <span className="text-flame italic">software systems.</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl">
              Verified software projects, deep learning vision models, and
              high-performance web applications built for accuracy, speed, and
              scale.
            </p>

            {/* Filter Tabs */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
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
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-6xl mx-auto space-y-12">
            {filteredProjects.map((project, i) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border border-border bg-card p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 hover:border-flame/50 transition-colors"
              >
                {/* Left Column: Title & Category */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[0.65rem] uppercase tracking-[0.2em] px-2.5 py-1 bg-flame/10 text-flame border border-flame/20">
                        {project.category}
                      </span>
                      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                        {project.status}
                      </span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl">
                      {project.title}
                    </h2>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Action Links */}
                  <div className="flex items-center gap-4 pt-4">
                    {project.githubUrl && (
                      <Magnetic strength={0.3}>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs uppercase tracking-[0.2em] border border-current px-4 py-2 inline-block hover:bg-flame hover:text-ink hover:border-flame transition-colors"
                        >
                          GitHub ↗
                        </a>
                      </Magnetic>
                    )}
                    {project.demoUrl && (
                      <Magnetic strength={0.3}>
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs uppercase tracking-[0.2em] border border-flame text-flame px-4 py-2 inline-block hover:bg-flame hover:text-ink transition-colors"
                        >
                          Live Demo ↗
                        </a>
                      </Magnetic>
                    )}
                  </div>
                </div>

                {/* Right Column: Problem, Solution, Metrics, Tech Stack */}
                <div className="lg:col-span-7 lg:border-l lg:border-border lg:pl-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                        Problem Statement
                      </h4>
                      <p className="text-sm text-foreground/90">
                        {project.problem}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                        Engineering Solution
                      </h4>
                      <p className="text-sm text-foreground/90">
                        {project.solution}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                        Verified Metrics
                      </h4>
                      <p className="text-sm font-display text-flame">
                        {project.metrics}
                      </p>
                    </div>
                  </div>

                  {/* Technology Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-[0.7rem] px-2.5 py-1 bg-muted text-muted-foreground border border-border"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
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
