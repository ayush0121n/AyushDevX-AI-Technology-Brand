import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Magnetic } from "@/components/site/Magnetic";

export const Route = createFileRoute("/ai-lab")({
  component: AILabPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — AI Lab & Intelligent Assistant" },
      {
        name: "description",
        content:
          "Experience interactive AI capabilities, RAG-powered assistants, and open-source models deployed in the AyushDevX AI Lab.",
      },
    ],
  }),
});

const tools = [
  {
    id: "portfolio-assistant",
    name: "AI Portfolio Assistant",
    desc: "Ask natural language questions about AyushDevX architecture, engineering experience, and technical systems.",
    status: "Active Demo",
    badge: "RAG Powered",
    comingSoon: false,
  },
  {
    id: "pdf-chat",
    name: "AI PDF Chat Studio",
    desc: "Upload technical research papers and PDF documents for interactive question-answering with page citations.",
    status: "In Development",
    badge: "Local Vector Search",
    comingSoon: true,
  },
  {
    id: "resume-analyzer",
    name: "AI Resume & ATS Matcher",
    desc: "Compare resumes against job descriptions to receive instant keyword gap scoring and cover letter drafts.",
    status: "Roadmap Q2",
    badge: "NLP Analysis",
    comingSoon: true,
  },
  {
    id: "data-analyst",
    name: "AI Data Analyst Studio",
    desc: "Upload CSV datasets to run Exploratory Data Analysis (EDA) and generate statistical summaries via natural language.",
    status: "Roadmap Q3",
    badge: "No-Code SQL",
    comingSoon: true,
  },
];

function AILabPage() {
  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Hero Header */}
        <section className="pt-36 pb-16 px-6 md:px-10 border-b border-border">
          <div className="max-w-6xl">
            <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-4">
              (05 / AI Lab)
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight">
              Interactive <br />
              <span className="text-flame italic">AI experimentation lab.</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl">
              Our live testbed for applied artificial intelligence,
              retrieval-augmented generation (RAG), and open-source inference
              pipelines.
            </p>
          </div>
        </section>

        {/* Live Portfolio Assistant Demo Section */}
        <section className="px-6 md:px-10 py-16 md:py-24 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="border border-flame/30 bg-card p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-flame text-ink text-[0.65rem] uppercase tracking-[0.2em] font-medium">
                Featured Live Assistant
              </div>

              <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-2">
                RAG Engine v1.0
              </span>
              <h2 className="font-display text-3xl md:text-5xl">
                AyushDevX Conversational Assistant
              </h2>
              <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
                Our AI Portfolio Assistant uses Retrieval-Augmented Generation to
                answer technical questions about our engineering architecture,
                selected work, and software principles without hallucination.
              </p>

              {/* Sample Interactive Chat Preview / Prompt Suggestions */}
              <div className="mt-8 space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Suggested Prompts:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "What is the architecture of MalariaScope?",
                    "How does AyushDevX handle RAG embeddings?",
                    "What tech stack powers the EstateXAI platform?",
                    "Explain your engineering philosophy.",
                  ].map((prompt) => (
                    <span
                      key={prompt}
                      className="px-3.5 py-2 bg-muted border border-border text-xs text-foreground/85 cursor-pointer hover:border-flame transition-colors"
                    >
                      &ldquo;{prompt}&rdquo;
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex items-center gap-4">
                <Magnetic strength={0.3}>
                  <Link
                    to="/products"
                    className="text-xs uppercase tracking-[0.2em] bg-flame text-ink px-6 py-3.5 inline-block font-medium hover:bg-flame/90 transition-colors"
                  >
                    View All AI Products →
                  </Link>
                </Magnetic>
              </div>
            </div>
          </div>
        </section>

        {/* AI Lab Tools Hub */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-2">
                  Tool Catalog
                </span>
                <h2 className="font-display text-4xl md:text-5xl">
                  Experimental tools.
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tools.map((tool, i) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="border border-border bg-card p-8 flex flex-col justify-between space-y-6"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[0.65rem] uppercase tracking-[0.2em] px-2.5 py-1 bg-flame/10 text-flame border border-flame/20">
                        {tool.badge}
                      </span>
                      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                        {tool.status}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl">
                      {tool.name}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    {tool.comingSoon ? (
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground italic">
                        In Active Development
                      </span>
                    ) : (
                      <Link
                        to="/products"
                        className="text-xs uppercase tracking-[0.2em] text-flame hover:underline font-medium"
                      >
                        Explore Product →
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
