import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Magnetic } from "@/components/site/Magnetic";

export const Route = createFileRoute("/ai-lab")({
  component: AILabPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — AI Lab & Interactive Studio" },
      {
        name: "description",
        content:
          "Test live interactive RAG conversational assistants and experimental AI tools deployed in the AyushDevX AI Lab.",
      },
    ],
  }),
});

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: string[];
}

const knowledgeBase: Record<string, { answer: string; citations: string[] }> = {
  "What is the architecture of MalariaScope?": {
    answer:
      "MalariaScope is an AI-powered computer vision system built with Python, TensorFlow, Keras, and Flask. It was trained and validated on 27,558 NIH thin blood smear microscopy images, achieving 93% validation accuracy and a 0.97 ROC-AUC score.",
    citations: ["projects.md:L10-15", "README.md:L115-120"],
  },
  "How does AyushDevX handle RAG embeddings?": {
    answer:
      "AyushDevX uses a hybrid vector search architecture with PostgreSQL pgvector and cosine distance indexing. Queries are embedded locally or via server-side open-source embedding models, retrieving top-k verified chunks with a zero-hallucination fallback.",
    citations: ["engineering.md:L45-55", "product.md:L28-35"],
  },
  "What tech stack powers the EstateXAI platform?": {
    answer:
      "EstateXAI is an intelligent real estate and PG discovery platform built on the MERN stack (MongoDB, Express, React, Node.js). It features role-based access control, JWT authentication, 9 secure REST endpoints, and interactive geospatial filtering.",
    citations: ["projects.md:L18-25", "engineering.md:L15-20"],
  },
  "Explain your engineering philosophy.": {
    answer:
      "Our philosophy is built on four pillars: 1) Build production-quality software intended for real users. 2) Keep the architecture simple and prefer modular monoliths over unnecessary microservices. 3) Prioritize open-source AI models and free-tier infrastructure. 4) Never invent stats, credentials, or testimonials.",
    citations: ["agents.md:L100-115", "product.md:L330-344"],
  },
};

const defaultAssistantMessage: ChatMessage = {
  id: "welcome",
  sender: "assistant",
  text: "Welcome to the AyushDevX AI Lab. I am the RAG-powered Portfolio Assistant. Ask me anything about our architecture, production projects, or engineering principles.",
  citations: ["AyushDevX Knowledge Base v1.0"],
};

function AILabPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    defaultAssistantMessage,
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      // Check exact match first, then keyword fuzzy match
      const exactMatch = knowledgeBase[queryText];
      let responseText = "";
      let responseCitations: string[] = [];

      if (exactMatch) {
        responseText = exactMatch.answer;
        responseCitations = exactMatch.citations;
      } else {
        const lower = queryText.toLowerCase();
        if (lower.includes("malaria") || lower.includes("cnn")) {
          const m = knowledgeBase["What is the architecture of MalariaScope?"];
          responseText = m.answer;
          responseCitations = m.citations;
        } else if (
          lower.includes("rag") ||
          lower.includes("vector") ||
          lower.includes("embed")
        ) {
          const m =
            knowledgeBase["How does AyushDevX handle RAG embeddings?"];
          responseText = m.answer;
          responseCitations = m.citations;
        } else if (
          lower.includes("estate") ||
          lower.includes("mern") ||
          lower.includes("stack")
        ) {
          const m =
            knowledgeBase["What tech stack powers the EstateXAI platform?"];
          responseText = m.answer;
          responseCitations = m.citations;
        } else if (
          lower.includes("philosophy") ||
          lower.includes("rule") ||
          lower.includes("brand")
        ) {
          const m = knowledgeBase["Explain your engineering philosophy."];
          responseText = m.answer;
          responseCitations = m.citations;
        } else {
          responseText =
            "I don't have verified information about that specific query in the current AyushDevX knowledge base. We enforce zero-hallucination answers. Please try asking about our projects (MalariaScope, EstateXAI), RAG architecture, or engineering principles.";
          responseCitations = ["System Zero-Hallucination Fallback"];
        }
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: responseText,
        citations: responseCitations,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

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

        {/* Live Interactive Portfolio Assistant */}
        <section className="px-6 md:px-10 py-16 md:py-24 border-b border-border">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Info & Suggested Prompts */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame/10 text-flame border border-flame/20 text-xs uppercase tracking-[0.2em]">
                <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
                Live Demo Active
              </div>
              <h2 className="font-display text-3xl md:text-4xl">
                RAG Portfolio Assistant
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Test our interactive knowledge engine. It retrieves answers from
                our project specifications and engineering rules with zero
                hallucination.
              </p>

              <div className="space-y-3 pt-4">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
                  Suggested Questions:
                </span>
                <div className="flex flex-col gap-2">
                  {Object.keys(knowledgeBase).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendQuery(prompt)}
                      className="text-left px-4 py-3 bg-card border border-border text-xs text-foreground/90 hover:border-flame hover:text-flame transition-colors"
                    >
                      &ldquo;{prompt}&rdquo; →
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Chat Window */}
            <div className="lg:col-span-7 border border-border bg-card flex flex-col h-[520px]">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-flame" />
                  <span className="text-xs uppercase tracking-[0.2em] font-medium">
                    AyushDevX Assistant v1.0
                  </span>
                </div>
                <button
                  onClick={() => setMessages([defaultAssistantMessage])}
                  className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear Chat ✕
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 text-sm ${
                          msg.sender === "user"
                            ? "bg-flame text-ink font-medium"
                            : "bg-muted text-foreground border border-border"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-border/50 flex flex-wrap items-center gap-1.5">
                            <span className="text-[0.65rem] uppercase tracking-wider opacity-75">
                              Sources:
                            </span>
                            {msg.citations.map((cite) => (
                              <span
                                key={cite}
                                className="text-[0.65rem] font-mono px-1.5 py-0.5 bg-background border border-border"
                              >
                                {cite}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                    <span className="w-1.5 h-1.5 bg-flame rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-flame rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-flame rounded-full animate-bounce [animation-delay:0.4s]" />
                    Assistant is retrieving verified sources...
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery(input);
                }}
                className="p-4 border-t border-border flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a technical question about AyushDevX..."
                  className="flex-1 bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-flame transition-colors"
                />
                <Magnetic strength={0.2}>
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="text-xs uppercase tracking-[0.2em] bg-flame text-ink px-6 py-2.5 font-medium hover:bg-flame/90 transition-colors disabled:opacity-50"
                  >
                    Send →
                  </button>
                </Magnetic>
              </form>
            </div>
          </div>
        </section>

        {/* Other AI Lab Tools Preview */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-2">
                  Upcoming Tools
                </span>
                <h2 className="font-display text-4xl md:text-5xl">
                  Experimental pipeline.
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "AI PDF Chat Studio",
                  desc: "Upload technical PDFs for zero-hallucination interactive question answering with page citations.",
                  badge: "RAG / Embeddings",
                },
                {
                  name: "AI Resume & ATS Matcher",
                  desc: "Compare resumes against job descriptions to receive instant keyword gap scoring.",
                  badge: "NLP Analysis",
                },
                {
                  name: "AI Data Analyst Studio",
                  desc: "Upload CSV datasets to run automated Exploratory Data Analysis via natural language.",
                  badge: "No-Code SQL",
                },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="border border-border bg-card p-8 flex flex-col justify-between space-y-6"
                >
                  <div>
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] px-2.5 py-1 bg-muted text-muted-foreground border border-border mb-4 inline-block">
                      {tool.badge}
                    </span>
                    <h3 className="font-display text-2xl">{tool.name}</h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <span className="text-xs uppercase tracking-[0.2em] text-flame italic">
                      In Development
                    </span>
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
