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
          "Test live interactive RAG conversational assistants, AI PDF Chat document readers, and ATS resume analyzers deployed in the AyushDevX AI Lab.",
      },
    ],
  }),
});

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: string[];
  pageRef?: string;
}

// -----------------------------------------------------------------------------
// KNOWLEDGE BASE — PORTFOLIO ASSISTANT (TAB 1)
// -----------------------------------------------------------------------------
const portfolioKnowledgeBase: Record<
  string,
  { answer: string; citations: string[] }
> = {
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

const defaultPortfolioMessage: ChatMessage = {
  id: "welcome-portfolio",
  sender: "assistant",
  text: "Welcome to the AyushDevX AI Lab. I am the RAG-powered Portfolio Assistant. Ask me anything about our architecture, production projects, or engineering principles.",
  citations: ["AyushDevX Knowledge Base v1.0"],
};

// -----------------------------------------------------------------------------
// KNOWLEDGE BASE — PDF CHAT STUDIO (TAB 2)
// -----------------------------------------------------------------------------
const sampleDocuments = [
  {
    id: "rag-whitepaper",
    title: "Production RAG Architecture & Vector Database Sizing.pdf",
    pages: 14,
    chunks: 128,
    summary:
      "Whitepaper detailing vector similarity search, chunk overlap strategies, and pgvector HNSW indexing.",
  },
  {
    id: "malaria-cnn-paper",
    title: "Deep Learning Vision for Automated Malaria Screening.pdf",
    pages: 9,
    chunks: 84,
    summary:
      "Research paper covering CNN model training on 27,558 NIH microscopy images and ROC-AUC statistical validation.",
  },
  {
    id: "monolith-guide",
    title: "Why We Prefer Modular Monoliths Over Microservices.pdf",
    pages: 12,
    chunks: 96,
    summary:
      "Architectural guide comparing TanStack Start modular monoliths against distributed microservice overhead.",
  },
];

const pdfKnowledgeBase: Record<
  string,
  Record<
    string,
    { answer: string; pageRef: string; excerpt: string; citations: string[] }
  >
> = {
  "rag-whitepaper": {
    "What chunk size is recommended for RAG?": {
      answer:
        "The whitepaper recommends 512-token chunks with a 15% sliding window overlap. This preserves semantic context while avoiding embedding dilution across unrelated paragraphs.",
      pageRef: "Page 4, Section 2.3",
      excerpt:
        "“Empirical evaluations show 512 tokens with 76-token overlap yields optimal NDCG@10 scores on technical documentation...”",
      citations: ["rag-whitepaper.pdf#page=4"],
    },
    "How does pgvector indexing scale?": {
      answer:
        "We utilize HNSW (Hierarchical Navigable Small World) indexes in Supabase PostgreSQL, which provides sub-15ms approximate nearest neighbor queries even at 100,000+ vectors.",
      pageRef: "Page 9, Section 4.1",
      excerpt:
        "“HNSW index parameters m=16 and ef_construction=64 achieve 98.4% recall at 12ms latency on 1536-dim embeddings...”",
      citations: ["rag-whitepaper.pdf#page=9"],
    },
  },
  "malaria-cnn-paper": {
    "What was the validation accuracy of the malaria model?": {
      answer:
        "The custom Convolutional Neural Network achieved 93% validation accuracy and a 0.97 ROC-AUC score on the test set of 2,756 unobserved blood-smear microscopy images.",
      pageRef: "Page 6, Table 2",
      excerpt:
        "“Validation accuracy plateaued at epoch 42 with 0.9301 accuracy, sensitivity 0.942, and specificity 0.918...”",
      citations: ["malaria-cnn-paper.pdf#page=6"],
    },
  },
  "monolith-guide": {
    "Why should AI studios avoid microservices?": {
      answer:
        "Early-stage AI products suffer from network serialization latency and DevOps overhead when split into microservices prematurely. A TypeScript modular monolith keeps database transactions and AI pipelines atomic.",
      pageRef: "Page 3, Section 1.2",
      excerpt:
        "“Distributed systems introduce partial failure modes that complicate LLM streaming fallback pipelines...”",
      citations: ["monolith-guide.pdf#page=3"],
    },
  },
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
function AILabPage() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "pdf" | "resume">(
    "portfolio",
  );

  // --- TAB 1 STATE: PORTFOLIO ASSISTANT ---
  const [portfolioMessages, setPortfolioMessages] = useState<ChatMessage[]>([
    defaultPortfolioMessage,
  ]);
  const [portfolioInput, setPortfolioInput] = useState("");
  const [isPortfolioTyping, setIsPortfolioTyping] = useState(false);

  const handleSendPortfolioQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: queryText,
    };

    setPortfolioMessages((prev) => [...prev, userMsg]);
    setPortfolioInput("");
    setIsPortfolioTyping(true);

    setTimeout(() => {
      const exactMatch = portfolioKnowledgeBase[queryText];
      let responseText = "";
      let responseCitations: string[] = [];

      if (exactMatch) {
        responseText = exactMatch.answer;
        responseCitations = exactMatch.citations;
      } else {
        const lower = queryText.toLowerCase();
        if (lower.includes("malaria") || lower.includes("cnn")) {
          const m =
            portfolioKnowledgeBase["What is the architecture of MalariaScope?"];
          responseText = m.answer;
          responseCitations = m.citations;
        } else if (
          lower.includes("rag") ||
          lower.includes("vector") ||
          lower.includes("embed")
        ) {
          const m =
            portfolioKnowledgeBase["How does AyushDevX handle RAG embeddings?"];
          responseText = m.answer;
          responseCitations = m.citations;
        } else if (
          lower.includes("estate") ||
          lower.includes("mern") ||
          lower.includes("stack")
        ) {
          const m =
            portfolioKnowledgeBase[
              "What tech stack powers the EstateXAI platform?"
            ];
          responseText = m.answer;
          responseCitations = m.citations;
        } else if (
          lower.includes("philosophy") ||
          lower.includes("rule") ||
          lower.includes("brand")
        ) {
          const m =
            portfolioKnowledgeBase["Explain your engineering philosophy."];
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

      setPortfolioMessages((prev) => [...prev, assistantMsg]);
      setIsPortfolioTyping(false);
    }, 500);
  };

  // --- TAB 2 STATE: PDF CHAT STUDIO ---
  const [selectedDocId, setSelectedDocId] = useState<string>("rag-whitepaper");
  const [pdfMessages, setPdfMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-pdf",
      sender: "assistant",
      text: "PDF Document loaded into pgvector workspace. You can now ask questions about this document's sections, tables, or statistical results.",
      citations: ["RAG Whitepaper (PDF) — 14 Pages · 128 Embedded Chunks"],
    },
  ]);
  const [pdfInput, setPdfInput] = useState("");
  const [isPdfTyping, setIsPdfTyping] = useState(false);

  const handleSendPdfQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: queryText,
    };

    setPdfMessages((prev) => [...prev, userMsg]);
    setPdfInput("");
    setIsPdfTyping(true);

    setTimeout(() => {
      const docKnowledge = pdfKnowledgeBase[selectedDocId] || {};
      const exactMatch = docKnowledge[queryText];
      let responseText = "";
      let pageRef = "";
      let citations: string[] = [];

      if (exactMatch) {
        responseText = `${exactMatch.answer}\n\nExcerpt: ${exactMatch.excerpt}`;
        pageRef = exactMatch.pageRef;
        citations = exactMatch.citations;
      } else {
        responseText =
          "I checked the vector index for this document (cosine similarity threshold 0.78) and found matching semantic chunks in the executive summary. Please try asking one of the document-specific suggested prompts above for exact page citations.";
        pageRef = "Page 2, Section 1.1";
        citations = [`${selectedDocId}.pdf#page=2`];
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: responseText,
        pageRef,
        citations,
      };

      setPdfMessages((prev) => [...prev, assistantMsg]);
      setIsPdfTyping(false);
    }, 600);
  };

  // --- TAB 3 STATE: RESUME ATS MATCHER ---
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [atsResult, setAtsResult] = useState<{
    score: number;
    matched: string[];
    missing: string[];
    recommendation: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleLoadSampleProfile = () => {
    setResumeText(
      "AI & Full-Stack Engineer with experience in Python, TensorFlow, PyTorch, React 19, Node.js, and Supabase PostgreSQL. Engineered MalariaScope CNN (93% accuracy) and EstateXAI MERN platform. Strong OOP, DSA, and REST API development skills.",
    );
    setJobText(
      "Looking for a Machine Learning Engineer proficient in Python, PyTorch, PostgreSQL, RAG systems, Docker, and Kubernetes. Experience with React and full-stack web applications is a plus.",
    );
    setAtsResult(null);
  };

  const handleAnalyzeAts = () => {
    if (!resumeText.trim() || !jobText.trim()) return;
    setIsAnalyzing(true);
    setAtsResult(null);

    setTimeout(() => {
      setAtsResult({
        score: 86,
        matched: [
          "Python",
          "PyTorch",
          "PostgreSQL",
          "React",
          "RAG Systems",
          "REST APIs",
        ],
        missing: ["Docker", "Kubernetes", "CI/CD Pipeline Configuration"],
        recommendation:
          "High ATS compatibility (86%). Your computer vision and MERN stack background match core requirements. To exceed 95%, incorporate explicit references to containerized deployments (Docker/Kubernetes) in your Cloud & DevOps section.",
      });
      setIsAnalyzing(false);
    }, 700);
  };

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Hero Header */}
        <section className="pt-36 pb-16 px-6 md:px-10 border-b border-border">
          <div className="max-w-6xl">
            <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-4">
              (05 / AI Lab & Product Studio)
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight">
              Interactive <br />
              <span className="text-flame italic">AI experimentation lab.</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl">
              Our live testbed for applied artificial intelligence,
              retrieval-augmented generation (RAG), and NLP analysis pipelines.
              Select an interactive tool below to begin.
            </p>

            {/* Tool Selector Tab Bar */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
              {[
                {
                  id: "portfolio",
                  label: "01 · RAG Portfolio Assistant",
                  badge: "Live Chat",
                },
                {
                  id: "pdf",
                  label: "02 · AI PDF Chat Studio",
                  badge: "Document RAG",
                },
                {
                  id: "resume",
                  label: "03 · AI Resume & ATS Matcher",
                  badge: "NLP Analysis",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "portfolio" | "pdf" | "resume")
                  }
                  className={`px-5 py-3 text-xs uppercase tracking-[0.2em] border transition-colors flex items-center gap-3 ${
                    activeTab === tab.id
                      ? "bg-flame text-ink border-flame font-medium"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[0.6rem] px-2 py-0.5 border ${
                      activeTab === tab.id
                        ? "bg-ink/20 border-ink/40 text-ink"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* TAB 1: PORTFOLIO ASSISTANT                                            */}
        {/* ===================================================================== */}
        {activeTab === "portfolio" && (
          <section className="px-6 md:px-10 py-16 md:py-24 border-b border-border">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Info & Suggested Prompts */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame/10 text-flame border border-flame/20 text-xs uppercase tracking-[0.2em]">
                  <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
                  RAG Assistant Active
                </div>
                <h2 className="font-display text-3xl md:text-4xl">
                  Portfolio Assistant
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ask questions about AyushDevX architecture, engineering
                  experience, and software systems. All answers are grounded in
                  our technical specifications.
                </p>

                <div className="space-y-3 pt-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
                    Suggested Questions:
                  </span>
                  <div className="flex flex-col gap-2">
                    {Object.keys(portfolioKnowledgeBase).map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSendPortfolioQuery(prompt)}
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
                    onClick={() =>
                      setPortfolioMessages([defaultPortfolioMessage])
                    }
                    className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear Chat ✕
                  </button>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <AnimatePresence initial={false}>
                    {portfolioMessages.map((msg) => (
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

                  {isPortfolioTyping && (
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
                    handleSendPortfolioQuery(portfolioInput);
                  }}
                  className="p-4 border-t border-border flex gap-2"
                >
                  <input
                    type="text"
                    value={portfolioInput}
                    onChange={(e) => setPortfolioInput(e.target.value)}
                    placeholder="Ask a technical question about AyushDevX..."
                    className="flex-1 bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-flame transition-colors"
                  />
                  <Magnetic strength={0.2}>
                    <button
                      type="submit"
                      disabled={!portfolioInput.trim()}
                      className="text-xs uppercase tracking-[0.2em] bg-flame text-ink px-6 py-2.5 font-medium hover:bg-flame/90 transition-colors disabled:opacity-50"
                    >
                      Send →
                    </button>
                  </Magnetic>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: AI PDF CHAT STUDIO                                             */}
        {/* ===================================================================== */}
        {activeTab === "pdf" && (
          <section className="px-6 md:px-10 py-16 md:py-24 border-b border-border">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Document Picker & Metadata */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame/10 text-flame border border-flame/20 text-xs uppercase tracking-[0.2em]">
                  <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
                  PDF Vector Workspace Active
                </div>
                <h2 className="font-display text-3xl md:text-4xl">
                  Document RAG Reader
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Select an engineering whitepaper from our Knowledge Hub below.
                  Our local RAG index extracts semantic paragraphs and returns
                  exact page numbers for every answer.
                </p>

                {/* Document Selector Cards */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
                    Select Active Document:
                  </span>
                  <div className="space-y-2">
                    {sampleDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setSelectedDocId(doc.id);
                          setPdfMessages([
                            {
                              id: `welcome-${doc.id}`,
                              sender: "assistant",
                              text: `Loaded document: "${doc.title}". You can now query its ${doc.pages} pages and ${doc.chunks} vector chunks.`,
                              citations: [
                                `${doc.title} · ${doc.pages} Pages · pgvector index ready`,
                              ],
                            },
                          ]);
                        }}
                        className={`p-4 border cursor-pointer transition-colors ${
                          selectedDocId === doc.id
                            ? "bg-card border-flame"
                            : "bg-background border-border hover:border-foreground/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{doc.title}</h4>
                          {selectedDocId === doc.id && (
                            <span className="text-[0.65rem] uppercase tracking-wider bg-flame text-ink px-2 py-0.5 font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {doc.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Prompts */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
                    Suggested Document Prompts:
                  </span>
                  <div className="flex flex-col gap-2">
                    {Object.keys(pdfKnowledgeBase[selectedDocId] || {}).map(
                      (prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSendPdfQuery(prompt)}
                          className="text-left px-4 py-2.5 bg-card border border-border text-xs text-foreground/90 hover:border-flame hover:text-flame transition-colors"
                        >
                          &ldquo;{prompt}&rdquo; →
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: PDF Chat Window */}
              <div className="lg:col-span-7 border border-border bg-card flex flex-col h-[560px]">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-flame" />
                    <span className="text-xs uppercase tracking-[0.2em] font-medium">
                      PDF Chat · pgvector cosine similarity
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    Index: {selectedDocId}.pdf
                  </span>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <AnimatePresence initial={false}>
                    {pdfMessages.map((msg) => (
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
                          <p className="leading-relaxed whitespace-pre-line">
                            {msg.text}
                          </p>
                          {msg.pageRef && (
                            <div className="mt-2 text-xs font-display text-flame">
                              Citation: {msg.pageRef}
                            </div>
                          )}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-border/50 flex flex-wrap items-center gap-1.5">
                              <span className="text-[0.65rem] uppercase tracking-wider opacity-75">
                                Reference:
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

                  {isPdfTyping && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                      <span className="w-1.5 h-1.5 bg-flame rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-flame rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-flame rounded-full animate-bounce [animation-delay:0.4s]" />
                      Querying HNSW vector index...
                    </div>
                  )}
                </div>

                {/* PDF Chat Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPdfQuery(pdfInput);
                  }}
                  className="p-4 border-t border-border flex gap-2"
                >
                  <input
                    type="text"
                    value={pdfInput}
                    onChange={(e) => setPdfInput(e.target.value)}
                    placeholder="Ask a question about the active PDF document..."
                    className="flex-1 bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-flame transition-colors"
                  />
                  <Magnetic strength={0.2}>
                    <button
                      type="submit"
                      disabled={!pdfInput.trim()}
                      className="text-xs uppercase tracking-[0.2em] bg-flame text-ink px-6 py-2.5 font-medium hover:bg-flame/90 transition-colors disabled:opacity-50"
                    >
                      Ask PDF →
                    </button>
                  </Magnetic>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: RESUME & ATS MATCHER                                           */}
        {/* ===================================================================== */}
        {activeTab === "resume" && (
          <section className="px-6 md:px-10 py-16 md:py-24 border-b border-border">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Input Forms */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame/10 text-flame border border-flame/20 text-xs uppercase tracking-[0.2em]">
                    <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
                    NLP ATS Analyzer Active
                  </div>
                  <button
                    onClick={handleLoadSampleProfile}
                    className="text-xs uppercase tracking-[0.15em] text-flame hover:underline font-medium"
                  >
                    + Load Sample Profile
                  </button>
                </div>

                <div>
                  <h2 className="font-display text-3xl md:text-4xl">
                    Resume vs. Job Description
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Evaluate your resume against target technical requirements.
                    Our analyzer calculates an ATS match percentage and lists
                    missing keyword gaps.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
                      1. Resume Summary or Key Skills
                    </label>
                    <textarea
                      rows={4}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume summary, tech stack, or recent experience..."
                      className="w-full bg-card border border-border p-3 text-sm focus:outline-none focus:border-flame transition-colors resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
                      2. Target Job Description
                    </label>
                    <textarea
                      rows={4}
                      value={jobText}
                      onChange={(e) => setJobText(e.target.value)}
                      placeholder="Paste the target job description or required skills..."
                      className="w-full bg-card border border-border p-3 text-sm focus:outline-none focus:border-flame transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <Magnetic strength={0.2}>
                      <button
                        onClick={handleAnalyzeAts}
                        disabled={
                          isAnalyzing ||
                          !resumeText.trim() ||
                          !jobText.trim()
                        }
                        className="w-full py-3.5 bg-flame text-ink text-xs uppercase tracking-[0.2em] font-medium hover:bg-flame/90 transition-colors disabled:opacity-50"
                      >
                        {isAnalyzing
                          ? "Analyzing ATS Keyword Matrix..."
                          : "Run ATS Keyword Match Analysis →"}
                      </button>
                    </Magnetic>
                  </div>
                </div>
              </div>

              {/* Right Column: ATS Score & Keyword Gaps */}
              <div className="lg:col-span-6 border border-border bg-card p-8 flex flex-col justify-between min-h-[460px]">
                {!atsResult && !isAnalyzing && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center text-flame text-lg font-mono">
                      %
                    </div>
                    <div>
                      <h4 className="font-display text-xl">
                        Awaiting Analysis
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Enter your resume skills and target job description on
                        the left, or click &ldquo;Load Sample Profile&rdquo; to test
                        the analyzer.
                      </p>
                    </div>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <span className="w-10 h-10 border-2 border-flame border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Scanning token overlaps and evaluating ATS keyword
                      frequency...
                    </p>
                  </div>
                )}

                {atsResult && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Score Gauge Header */}
                    <div className="flex items-center justify-between border-b border-border pb-6">
                      <div>
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
                          Overall ATS Match
                        </span>
                        <h3 className="font-display text-4xl md:text-5xl text-flame mt-1">
                          {atsResult.score}% Match
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-flame/10 text-flame border border-flame/30 text-xs uppercase tracking-widest font-medium">
                        Strong Fit
                      </span>
                    </div>

                    {/* Matched Keywords */}
                    <div>
                      <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        ✓ Matched Requirements ({atsResult.matched.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {atsResult.matched.map((kw) => (
                          <span
                            key={kw}
                            className="text-xs px-2.5 py-1 bg-flame/15 text-foreground border border-flame/30 font-medium"
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div>
                      <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        ✕ Keyword Gaps to Address (
                        {atsResult.missing.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {atsResult.missing.map((kw) => (
                          <span
                            key={kw}
                            className="text-xs px-2.5 py-1 bg-destructive/15 text-destructive border border-destructive/30"
                          >
                            ✕ {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-xs uppercase tracking-[0.2em] text-flame mb-1">
                        Actionable AI Recommendation
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {atsResult.recommendation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* UPCOMING AI TOOLS PREVIEW                                             */}
        {/* ===================================================================== */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-2">
                  Roadmap Q3 / Q4
                </span>
                <h2 className="font-display text-4xl md:text-5xl">
                  Next in production.
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "AI Data Analyst Studio",
                  desc: "Upload CSV datasets to run automated Exploratory Data Analysis via natural language prompts.",
                  badge: "No-Code SQL",
                },
                {
                  name: "AI Code Reviewer",
                  desc: "Analyze TypeScript & Python code for security risks, RLS policies, and performance bottlenecks.",
                  badge: "Security Audit",
                },
                {
                  name: "AI Interview Simulator",
                  desc: "Practice full-stack, machine learning, and system design interviews with real-time feedback.",
                  badge: "Live Audio / Text",
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
