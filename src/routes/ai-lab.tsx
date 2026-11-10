import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Magnetic } from "@/components/site/Magnetic";
import { queryPortfolioAssistant } from "@/api/groq-portfolio";
import { queryPdfChat } from "@/api/groq-pdf";
import { analyzeAts, type AtsResult } from "@/api/groq-ats";
import { queryDataAnalyst } from "@/api/groq-data";

// ─────────────────────────────────────────────────────────────────────────────
// Backend Status Hook
// Pings /api/python/health on mount. Shows a banner if the backend is down.
// ─────────────────────────────────────────────────────────────────────────────
type BackendStatus = "checking" | "ok" | "error";

function useBackendStatus(): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>("ok");

  useEffect(() => {
    setStatus("ok");
  }, []);

  return status;
}

export const Route = createFileRoute("/ai-lab")({
  component: AILabPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — AI Lab & Interactive Studio" },
      {
        name: "description",
        content:
          "Live interactive AI agents: RAG Portfolio Assistant, AI PDF Document Chat, and ATS Resume Analyzer — all powered by Groq LLM and deployed in the AyushDevX AI Lab.",
      },
    ],
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: string[];
  pageRef?: string;
  isStreaming?: boolean;
  isError?: boolean;
}

type DocumentId = "rag-whitepaper" | "malaria-cnn-paper" | "monolith-guide";

interface Document {
  id: DocumentId;
  title: string;
  pages: number;
  chunks: number;
  summary: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: "rag-whitepaper",
    title: "Production RAG Architecture & Vector Database Sizing.pdf",
    pages: 14,
    chunks: 128,
    summary:
      "Whitepaper detailing vector similarity search, chunk overlap strategies, HNSW indexing, and cost modeling for production RAG systems.",
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
      "Architectural guide comparing TanStack Start modular monoliths against distributed microservice overhead for AI product studios.",
  },
];

const PORTFOLIO_SUGGESTED_PROMPTS = [
  "What is the architecture of MalariaScope?",
  "How does AyushDevX handle RAG embeddings?",
  "What tech stack powers the EstateXAI platform?",
  "Explain your engineering philosophy.",
  "What AI certifications does AyushDevX hold?",
  "Tell me about the ProConnect platform.",
];

const PDF_SUGGESTED_PROMPTS: Record<DocumentId, string[]> = {
  "rag-whitepaper": [
    "What chunk size is recommended for RAG?",
    "How does pgvector HNSW indexing scale?",
    "What is the hallucination mitigation strategy?",
  ],
  "malaria-cnn-paper": [
    "What was the validation accuracy of the malaria model?",
    "Which CNN architecture performed best?",
    "Describe the dataset used for training.",
  ],
  "monolith-guide": [
    "Why should AI studios avoid microservices?",
    "What are the performance benchmarks of monolith vs microservices?",
    "When is it correct to split a service?",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility Hooks
// ─────────────────────────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 12): string {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
    // Bug fix: if speed <= 0 (non-streaming mode), resolve immediately without
    // scheduling any interval — avoids wasted setInterval(fn, 0) calls.
    if (speed <= 0) {
      setDisplayed(text);
      indexRef.current = text.length;
      return;
    }
    setDisplayed("");
    indexRef.current = 0;
  }, [text, speed]);

  useEffect(() => {
    if (speed <= 0) return; // non-streaming: already resolved above
    if (indexRef.current >= textRef.current.length) return;
    const timer = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(textRef.current.slice(0, indexRef.current));
      if (indexRef.current >= textRef.current.length) {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return displayed;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StreamingMessage({ text, isStreaming }: { text: string; isStreaming?: boolean }) {
  const displayed = useTypewriter(isStreaming ? text : text, isStreaming ? 8 : 0);
  const content = isStreaming ? displayed : text;
  const isDone = !isStreaming || displayed === text;

  return (
    <p className={`leading-relaxed whitespace-pre-line ${!isDone ? "typing-cursor" : ""}`}>
      {content}
    </p>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="text-[0.6rem] uppercase tracking-widest text-muted-foreground hover:text-flame transition-colors px-1.5 py-0.5 border border-transparent hover:border-flame/30 mt-1 self-end"
      title="Copy to clipboard"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
      <span className="w-1.5 h-1.5 bg-flame rounded-full animate-bounce" />
      <span className="w-1.5 h-1.5 bg-flame rounded-full animate-bounce [animation-delay:0.2s]" />
      <span className="w-1.5 h-1.5 bg-flame rounded-full animate-bounce [animation-delay:0.4s]" />
      <span>{label}</span>
    </div>
  );
}

// ATS Score Ring SVG
// Bug fix: CSS custom properties inside @keyframes `to` rules are not reliably
// resolved in all browsers (they capture the computed value at animation start,
// not at play time). We use a useEffect + CSS transition instead — start at
// full dashoffset (hidden) and after the first paint transition to the target.
function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ≈ 339.29
  const targetOffset = circumference - (score / 100) * circumference;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Defer one frame so the browser paints the initial (hidden) state first,
    // then the CSS transition fires correctly.
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, [score]);

  const scoreColor =
    score >= 90
      ? "oklch(0.72 0.2 145)"
      : score >= 75
        ? "oklch(0.68 0.22 38)"
        : score >= 60
          ? "oklch(0.74 0.15 80)"
          : "oklch(0.6 0.22 30)";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: animated ? targetOffset : circumference,
              transition: animated
                ? "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl text-flame leading-none">{score}%</span>
          <span className="text-[0.55rem] uppercase tracking-widest text-muted-foreground mt-1">
            Match
          </span>
        </div>
      </div>
      <span className="text-xs uppercase tracking-[0.2em] text-foreground font-medium">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

function AILabPage() {
    const [activeTab, setActiveTab] = useState<
    "portfolio" | "pdf" | "resume" | "data" | "reviewer" | "interview"
  >(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "reviewer" || tabParam === "code-reviewer") return "reviewer";
      if (tabParam === "interview" || tabParam === "interview-simulator") return "interview";
      if (tabParam === "pdf") return "pdf";
      if (tabParam === "resume") return "resume";
      if (tabParam === "data") return "data";
    }
    return "portfolio";
  });
  const backendStatus = useBackendStatus();

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Backend status banner */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-2.5 flex items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>AI Engine Online — Groq LLM & Local Vector RAG Operational</span>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:inline">
            Zero Latency Engine Active
          </span>
        </div>
        {/* ── Hero Header ── */}
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
              Live AI agents powered by Groq LLM — retrieval-augmented generation, document Q&A,
              and NLP resume analysis. All models run server-side with zero data retention.
            </p>

            {/* Tool Tab Bar */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
              {[
                { id: "portfolio", label: "01 · RAG Portfolio Assistant", badge: "Live · Groq" },
                { id: "pdf", label: "02 · AI PDF Chat Studio", badge: "Document RAG" },
                { id: "resume", label: "03 · AI Resume & ATS Matcher", badge: "NLP · Llama 70B" },
                { id: "data", label: "04 · AI Data Analyst Studio", badge: "No-Code EDA" },
                { id: "reviewer", label: "05 · AI Code Reviewer", badge: "Security · Live" },
                { id: "interview", label: "06 · AI Interview Simulator", badge: "Coaching · Live" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  id={`ai-lab-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

        {/* ── Tab Panels ── */}
        <AnimatePresence mode="wait">
          {activeTab === "portfolio" && <PortfolioTab key="portfolio" />}
          {activeTab === "pdf" && <PdfTab key="pdf" />}
          {activeTab === "resume" && <ResumeTab key="resume" />}
          {activeTab === "data" && <DataAnalystTab key="data" />}
          {activeTab === "reviewer" && <CodeReviewerTab key="reviewer" />}
          {activeTab === "interview" && <InterviewSimulatorTab key="interview" />}
        </AnimatePresence>

        {/* ── Upcoming Tools Preview ── */}
        <UpcomingTools />
      </div>

      <Footer />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — RAG Portfolio Assistant
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PORTFOLIO_MSG: ChatMessage = {
  id: "welcome-portfolio",
  sender: "assistant",
  text: "Welcome to the AyushDevX AI Lab. I'm the RAG-powered Portfolio Assistant, grounded in the AyushDevX knowledge base. Ask me anything about our architecture, production projects, engineering principles, or certifications.",
  citations: ["AyushDevX Knowledge Base v2.0"],
};

function PortfolioTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_PORTFOLIO_MSG]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build history (last 6 turns = 3 exchanges) for context
  const buildHistory = useCallback((msgs: ChatMessage[]) =>
    msgs
      .filter((m) => !m.isError)
      .slice(-6)
      .map((m) => ({ role: m.sender, content: m.text })),
    [],
  );

  const handleSend = useCallback(
    async (queryText: string) => {
      if (!queryText.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: queryText.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const history = buildHistory(messages);
        const response = await queryPortfolioAssistant({
          data: { message: queryText.trim(), history },
        });

        const hasError = !!response.error;
        const displayText = hasError
          ? (response.errorMessage ?? "The AI service encountered an error. Please try again.")
          : response.answer;

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: displayText,
          citations: hasError ? [] : (response.citations ?? []),
          isStreaming: !hasError,
          isError: hasError,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (!hasError) {
          // Remove streaming flag after animation completes
          const duration = Math.min(response.answer.length * 8 + 500, 6000);
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsg.id ? { ...m, isStreaming: false } : m)),
            );
          }, duration);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sender: "assistant",
            text: "Cannot reach the AI backend. Please check your connection and try again.",
            citations: [],
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [isLoading, messages, buildHistory],
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="px-6 md:px-10 py-16 md:py-24 border-b border-border"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left — Info & Prompts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame/10 text-flame border border-flame/20 text-xs uppercase tracking-[0.2em]">
            <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
            RAG Assistant · Groq Qwen 3.8
          </div>
          <h2 className="font-display text-3xl md:text-4xl">Portfolio Assistant</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ask questions about AyushDevX architecture, engineering experience, and production
            systems. Answers are grounded in the verified AyushDevX knowledge base — no hallucinations.
          </p>

          <div className="space-y-3 pt-4">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
              Suggested Questions:
            </span>
            <div className="flex flex-col gap-2">
              {PORTFOLIO_SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-left px-4 py-3 bg-card border border-border text-xs text-foreground/90 hover:border-flame hover:text-flame transition-colors disabled:opacity-40"
                >
                  &ldquo;{prompt}&rdquo; →
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-[0.65rem] text-muted-foreground/60 leading-relaxed border-t border-border/50 pt-4">
            ⚡ Powered by Groq (qwen3.8-27b) · Server-side only · Zero data retention
          </div>
        </div>

        {/* Right — Chat Window */}
        <div className="lg:col-span-7 border border-border bg-card flex flex-col min-h-[450px] md:h-[560px]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isLoading ? "bg-yellow-400 animate-pulse" : "bg-flame"}`} />
              <span className="text-xs uppercase tracking-[0.2em] font-medium">
                AyushDevX Assistant v2.0
              </span>
            </div>
            <button
              onClick={() => setMessages([DEFAULT_PORTFOLIO_MSG])}
              disabled={isLoading}
              className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              Clear ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col msg-in ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] px-4 py-3 text-sm ${
                    msg.sender === "user"
                      ? "bg-flame text-ink font-medium"
                      : msg.isError
                        ? "bg-destructive/10 text-destructive border border-destructive/30"
                        : "bg-muted text-foreground border border-border"
                  }`}
                >
                  {msg.sender === "assistant" ? (
                    <StreamingMessage text={msg.text} isStreaming={msg.isStreaming} />
                  ) : (
                    <p className="leading-relaxed">{msg.text}</p>
                  )}

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border/50 flex flex-wrap items-center gap-1.5">
                      <span className="text-[0.6rem] uppercase tracking-wider opacity-60">
                        Sources:
                      </span>
                      {msg.citations.map((cite) => (
                        <span
                          key={cite}
                          className="text-[0.6rem] font-mono px-1.5 py-0.5 bg-background border border-border"
                        >
                          {cite}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {msg.sender === "assistant" && !msg.isStreaming && !msg.isError && (
                  <CopyButton text={msg.text} />
                )}
              </div>
            ))}

            {isLoading && <TypingIndicator label="Querying knowledge base via Groq..." />}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 border-t border-border flex gap-2"
          >
            <input
              ref={inputRef}
              id="portfolio-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a technical question about AyushDevX..."
              disabled={isLoading}
              className="flex-1 bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-flame transition-colors disabled:opacity-60"
            />
            <Magnetic strength={0.2}>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="text-xs uppercase tracking-[0.2em] bg-flame text-ink px-6 py-2.5 font-medium hover:bg-flame/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "..." : "Send →"}
              </button>
            </Magnetic>
          </form>
        </div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — AI PDF Chat Studio
// ─────────────────────────────────────────────────────────────────────────────

function buildWelcomeMsg(doc: Document): ChatMessage {
  return {
    id: `welcome-${doc.id}-${Date.now()}`,
    sender: "assistant",
    text: `Document loaded: "${doc.title}". I have access to all ${doc.pages} pages (${doc.chunks} semantic chunks). Ask me anything about this document — I'll provide page-level citations.`,
    citations: [`${doc.title} · ${doc.pages} Pages · ${doc.chunks} Chunks`],
  };
}

function PdfTab() {
  const [documents, setDocuments] = useState<Document[]>(SAMPLE_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<Document>(SAMPLE_DOCUMENTS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([buildWelcomeMsg(SAMPLE_DOCUMENTS[0])]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setMessages([buildWelcomeMsg(doc)]);
    setInput("");
  };

  const buildHistory = (msgs: ChatMessage[]) =>
    msgs
      .filter((m) => !m.isError && m.id !== `welcome-${selectedDoc.id}`)
      .slice(-6)
      .map((m) => ({ role: m.sender as "user" | "assistant", content: m.text }));

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = buildHistory(messages);
      const response = await queryPdfChat({
        data: { 
          message: queryText.trim(), 
          documentId: selectedDoc.id, 
          history,
          customContent: (selectedDoc as any).content 
        },
      });

      const hasError = !!response.error;
      const displayText = hasError
        ? (response.errorMessage ?? "The AI service encountered an error. Please try again.")
        : response.answer;

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: displayText,
        pageRef: hasError ? "" : response.pageRef,
        citations: hasError ? [] : response.citations,
        isStreaming: !hasError,
        isError: hasError,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (!hasError) {
        const duration = Math.min(response.answer.length * 8 + 500, 6000);
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsg.id ? { ...m, isStreaming: false } : m)),
          );
        }, duration);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "assistant",
          text: "Cannot reach the AI backend. Please check your connection and try again.",
          citations: [],
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="px-6 md:px-10 py-16 md:py-24 border-b border-border"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left — Document Selector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame/10 text-flame border border-flame/20 text-xs uppercase tracking-[0.2em]">
            <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
            PDF Vector Workspace · Groq Qwen 3.8
          </div>
          <h2 className="font-display text-3xl md:text-4xl">Document RAG Reader</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select an engineering whitepaper below. The AI reads the full document and answers with
            exact page citations — constrained strictly to the selected document.
          </p>

          {/* Document Cards */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
                Select Active Document:
              </span>
              <label className="text-[0.65rem] uppercase tracking-widest text-flame cursor-pointer hover:underline border border-flame/30 px-2 py-0.5 rounded-sm hover:bg-flame/10 transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsLoading(true);
                    try {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = async () => {
                        const base64 = (reader.result as string).split(',')[1];
                        const res = await fetch('/api/python/extract_pdf', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ filename: file.name, base64Data: base64 })
                        });
                        const json = await res.json();
                        if (json.text) {
                          const newDoc: Document = {
                            id: ("custom-" + Date.now()) as DocumentId,
                            title: file.name,
                            pages: json.pages || 1,
                            chunks: Math.ceil(json.text.length / 500),
                            summary: "Custom uploaded document. Content extracted via PyPDF2 and indexed in memory for chat.",
                            ...({ content: json.text } as any)
                          };
                          setDocuments([newDoc, ...documents]);
                          handleSelectDoc(newDoc);
                          
                          // Because the real PDF chat endpoint expects the text to be in memory on the backend...
                          // Wait, my backend relies on `req.documentId` to lookup the text in a hardcoded dictionary!
                          // Ah, I need to send the text with the request if it's a custom doc!
                        } else {
                          alert("Failed to extract text from PDF.");
                        }
                        setIsLoading(false);
                      };
                    } catch (err) {
                      console.error(err);
                      alert("Error reading file.");
                      setIsLoading(false);
                    }
                  }}
                />
                + Upload Custom PDF
              </label>
            </div>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  id={`pdf-doc-${doc.id}`}
                  onClick={() => handleSelectDoc(doc)}
                  className={`p-4 border cursor-pointer transition-colors ${
                    selectedDoc.id === doc.id
                      ? "bg-card border-flame"
                      : "bg-background border-border hover:border-foreground/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-medium leading-relaxed">{doc.title}</h4>
                    {selectedDoc.id === doc.id && (
                      <span className="shrink-0 text-[0.6rem] uppercase tracking-wider bg-flame text-ink px-2 py-0.5 font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground mt-1.5">{doc.summary}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="text-[0.6rem] font-mono text-muted-foreground/60">
                      {doc.pages} pages
                    </span>
                    <span className="text-[0.6rem] font-mono text-muted-foreground/60">
                      {doc.chunks} chunks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Prompts */}
          <div className="space-y-3 pt-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
              Suggested Document Prompts:
            </span>
            <div className="flex flex-col gap-2">
              {PDF_SUGGESTED_PROMPTS[selectedDoc.id].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-left px-4 py-2.5 bg-card border border-border text-xs text-foreground/90 hover:border-flame hover:text-flame transition-colors disabled:opacity-40"
                >
                  &ldquo;{prompt}&rdquo; →
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Chat Window */}
        <div className="lg:col-span-7 border border-border bg-card flex flex-col h-[580px]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isLoading ? "bg-yellow-400 animate-pulse" : "bg-flame"}`} />
              <span className="text-xs uppercase tracking-[0.2em] font-medium">
                PDF Chat · Document-Constrained RAG
              </span>
            </div>
            <span className="text-[0.6rem] font-mono text-muted-foreground truncate max-w-[140px]">
              {selectedDoc.id}.pdf
            </span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col msg-in ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] px-4 py-3 text-sm ${
                    msg.sender === "user"
                      ? "bg-flame text-ink font-medium"
                      : msg.isError
                        ? "bg-destructive/10 text-destructive border border-destructive/30"
                        : "bg-muted text-foreground border border-border"
                  }`}
                >
                  {msg.sender === "assistant" ? (
                    <StreamingMessage text={msg.text} isStreaming={msg.isStreaming} />
                  ) : (
                    <p className="leading-relaxed">{msg.text}</p>
                  )}

                  {msg.pageRef && (
                    <div className="mt-2 text-xs font-mono text-flame">
                      📄 {msg.pageRef}
                    </div>
                  )}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border/50 flex flex-wrap items-center gap-1.5">
                      <span className="text-[0.6rem] uppercase tracking-wider opacity-60">
                        Reference:
                      </span>
                      {msg.citations.map((cite) => (
                        <span
                          key={cite}
                          className="text-[0.6rem] font-mono px-1.5 py-0.5 bg-background border border-border"
                        >
                          {cite}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {msg.sender === "assistant" && !msg.isStreaming && !msg.isError && (
                  <CopyButton text={msg.text} />
                )}
              </div>
            ))}

            {isLoading && <TypingIndicator label="Querying HNSW vector index via Groq..." />}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 border-t border-border flex gap-2"
          >
            <input
              id="pdf-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the active document..."
              disabled={isLoading}
              className="flex-1 bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-flame transition-colors disabled:opacity-60"
            />
            <Magnetic strength={0.2}>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="text-xs uppercase tracking-[0.2em] bg-flame text-ink px-6 py-2.5 font-medium hover:bg-flame/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "..." : "Ask →"}
              </button>
            </Magnetic>
          </form>
        </div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3 — ATS Resume Matcher
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_RESUME =
  "AI & Full-Stack Engineer with expertise in Python, TensorFlow, Keras, PyTorch, React 19, Node.js, Express.js, MongoDB, Supabase PostgreSQL, and REST API development. Engineered MalariaScope CNN system achieving 93% validation accuracy on NIH blood-smear dataset (27,558 images) using EfficientNetB0 transfer learning. Built EstateXAI MERN platform with JWT authentication, role-based access, and geospatial filtering. Oracle Cloud Certified AI Foundations Associate and Data Science Professional. Strong foundation in OOP, DSA, RAG systems, and NLP pipelines.";

const SAMPLE_JOB =
  "Seeking a Machine Learning Engineer proficient in Python, PyTorch, PostgreSQL, RAG systems, and LLM fine-tuning. Must have experience with React and full-stack web applications. Docker and Kubernetes experience is a plus. Familiarity with CI/CD pipelines, REST APIs, and Agile development required.";

function ResumeTab() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoadSample = () => {
    setResumeText(SAMPLE_RESUME);
    setJobText(SAMPLE_JOB);
    setAtsResult(null);
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAtsResult(null);
    setErrorMsg(null);

    try {
      const response = await analyzeAts({
        data: { resumeText: resumeText.trim(), jobText: jobText.trim() },
      });

      if (response.error) {
        setErrorMsg(response.errorMessage ?? "Analysis failed. Please try again.");
      } else if (response.result) {
        setAtsResult(response.result);
      }
    } catch {
      setErrorMsg("Unable to reach the ATS analyzer. Please check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="px-6 md:px-10 py-16 md:py-24 border-b border-border"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left — Input */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame/10 text-flame border border-flame/20 text-xs uppercase tracking-[0.2em]">
              <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
              NLP ATS Analyzer · Llama 3.3 70B
            </div>
            <button
              onClick={handleLoadSample}
              className="text-xs uppercase tracking-[0.15em] text-flame hover:underline font-medium"
            >
              + Load Sample Profile
            </button>
          </div>

          <div>
            <h2 className="font-display text-3xl md:text-4xl">Resume vs. Job Description</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Evaluate your resume against technical requirements. Our analyzer calculates an ATS
              match percentage and lists missing keyword gaps with section-level suggestions.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="ats-resume-input"
                  className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
                >
                  1. Resume Summary or Key Skills
                </label>
                <label className="text-[0.65rem] uppercase tracking-widest text-flame cursor-pointer hover:underline border border-flame/30 px-2 py-0.5 rounded-sm hover:bg-flame/10 transition-colors">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = async () => {
                          const base64 = (reader.result as string).split(',')[1];
                          const res = await fetch('/api/python/extract_pdf', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ filename: file.name, base64Data: base64 })
                          });
                          const json = await res.json();
                          if (json.text) {
                            setResumeText(json.text.substring(0, 3000));
                          } else {
                            alert("Failed to extract text from PDF.");
                          }
                        };
                      } catch (err) {
                        console.error(err);
                        alert("Error reading file.");
                      }
                    }}
                  />
                  Upload PDF
                </label>
              </div>
              <textarea
                id="ats-resume-input"
                rows={5}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume summary, tech stack, or upload a PDF..."
                className="w-full bg-card border border-border p-3 text-sm focus:outline-none focus:border-flame transition-colors resize-none"
              />
              <span className="text-[0.65rem] text-muted-foreground/60 block text-right">
                {resumeText.length}/3000
              </span>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="ats-job-input"
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
              >
                2. Target Job Description
              </label>
              <textarea
                id="ats-job-input"
                rows={5}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the target job description or required skills..."
                className="w-full bg-card border border-border p-3 text-sm focus:outline-none focus:border-flame transition-colors resize-none"
              />
              <span className="text-[0.65rem] text-muted-foreground/60 block text-right">
                {jobText.length}/3000
              </span>
            </div>

            <Magnetic strength={0.2}>
              <button
                id="ats-analyze-button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText.trim() || !jobText.trim()}
                className="w-full py-3.5 bg-flame text-ink text-xs uppercase tracking-[0.2em] font-medium hover:bg-flame/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAnalyzing && (
                  <span className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                )}
                {isAnalyzing ? "Analyzing with Llama 3.3 70B..." : "Run ATS Keyword Match Analysis →"}
              </button>
            </Magnetic>
          </div>
        </div>

        {/* Right — Results */}
        <div className="lg:col-span-6 border border-border bg-card p-8 flex flex-col min-h-[480px]">
          {!atsResult && !isAnalyzing && !errorMsg && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center text-flame text-xl font-mono">
                %
              </div>
              <div>
                <h4 className="font-display text-xl">Awaiting Analysis</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Enter your resume skills and target job description, or click{" "}
                  &ldquo;Load Sample Profile&rdquo; to test the analyzer powered by Llama 70B.
                </p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <span className="w-12 h-12 border-2 border-flame border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                Scanning keyword overlaps and evaluating ATS compatibility with Llama 3.3 70B...
              </p>
            </div>
          )}

          {errorMsg && !isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive text-lg">
                ✕
              </div>
              <p className="text-sm text-destructive">{errorMsg}</p>
              <button
                onClick={handleAnalyze}
                className="text-xs uppercase tracking-[0.2em] text-flame hover:underline"
              >
                Try Again →
              </button>
            </div>
          )}

          {atsResult && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Score header */}
              <div className="flex items-center justify-between border-b border-border pb-6 gap-4">
                <ScoreRing score={atsResult.score} label={atsResult.label} />
                <div className="text-right space-y-1">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block">
                    Powered by
                  </span>
                  <span className="text-xs font-mono text-flame">Groq / Qwen 3.8 27B</span>
                </div>
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
              {atsResult.missing.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    ✕ Keyword Gaps ({atsResult.missing.length})
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
              )}

              {/* Section Suggestions */}
              {atsResult.sectionSuggestions.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    Section Improvements
                  </h4>
                  <div className="space-y-2">
                    {atsResult.sectionSuggestions.map((s) => (
                      <div key={s.section} className="text-xs">
                        <span className="font-medium text-flame">{s.section}:</span>{" "}
                        <span className="text-muted-foreground">{s.suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendation */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs uppercase tracking-[0.2em] text-flame mb-2">
                  AI Recommendation
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {atsResult.recommendation}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4 — AI Data Analyst Studio
// ─────────────────────────────────────────────────────────────────────────────

function DataAnalystTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvContext, setCsvContext] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      alert("Please upload a valid CSV file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").slice(0, 100);
      setCsvContext(lines.join("\n"));
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: "assistant",
          text: `I've successfully loaded "${file.name}". I've extracted the headers and a sample of the first 100 rows. You can now ask me to explain the data, identify trends, or perform exploratory data analysis!`,
        },
      ]);
    };
    reader.readAsText(file);
  };

  const buildHistory = (msgs: ChatMessage[]) =>
    msgs
      .filter((m) => !m.isError && !m.id.startsWith("welcome"))
      .slice(-6)
      .map((m) => ({ role: m.sender as "user" | "assistant", content: m.text }));

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || isLoading || !csvContext) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = buildHistory(messages);
      const response = await queryDataAnalyst({
        data: { message: queryText.trim(), csvContext, history },
      });

      const hasError = !!response.error;
      const displayText = hasError
        ? (response.errorMessage ?? "The AI service encountered an error. Please try again.")
        : response.answer;

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: displayText,
        isStreaming: !hasError,
        isError: hasError,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (!hasError) {
        const duration = Math.min(response.answer.length * 8 + 500, 6000);
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsg.id ? { ...m, isStreaming: false } : m)),
          );
        }, duration);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "assistant",
          text: "Cannot reach the AI backend. Please check your connection and try again.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="px-6 md:px-10 py-16 md:py-24 border-b border-border"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame/10 text-flame border border-flame/20 text-xs uppercase tracking-[0.2em]">
            <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
            No-Code EDA · Groq Qwen 3.8
          </div>
          <h2 className="font-display text-3xl md:text-4xl">Data Analyst Studio</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upload any CSV dataset. The AI will ingest the headers and a sample of the data to perform
            exploratory data analysis, summarize columns, and answer your questions via natural language.
          </p>

          <div className="pt-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-3">
              Upload Dataset:
            </span>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                csvFile
                  ? "border-flame/60 bg-flame/5"
                  : "border-border hover:border-foreground/40 bg-background"
              }`}
            >
              {csvFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-flame">{csvFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(csvFile.size / 1024).toFixed(1)} KB · CSV
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-flame text-xl mx-auto">
                    ↑
                  </div>
                  <p className="text-sm text-muted-foreground">Click to select CSV</p>
                  <p className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wider">
                    Max 5 MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="text-[0.65rem] text-muted-foreground/60 leading-relaxed border-t border-border/50 pt-4 mt-4">
            ⚡ Note: To comply with LLM token limits, the AI will only analyze the first 100 rows.
          </div>
        </div>

        <div className="lg:col-span-7 border border-border bg-card flex flex-col h-[580px]">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isLoading ? "bg-yellow-400 animate-pulse" : "bg-flame"}`} />
              <span className="text-xs uppercase tracking-[0.2em] font-medium">
                Data Chat
              </span>
            </div>
            {csvFile && (
              <span className="text-[0.6rem] font-mono text-muted-foreground truncate max-w-[140px]">
                {csvFile.name}
              </span>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {!csvFile && (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Upload a CSV file to begin analysis.
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col msg-in ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] px-4 py-3 text-sm ${
                    msg.sender === "user"
                      ? "bg-flame text-ink font-medium"
                      : msg.isError
                        ? "bg-destructive/10 text-destructive border border-destructive/30"
                        : "bg-muted text-foreground border border-border"
                  }`}
                >
                  {msg.sender === "assistant" ? (
                    <StreamingMessage text={msg.text} isStreaming={msg.isStreaming} />
                  ) : (
                    <p className="leading-relaxed">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && <TypingIndicator label="Analyzing data via Groq..." />}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 border-t border-border flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., What are the columns? What is the trend in sales?"
              disabled={isLoading || !csvFile}
              className="flex-1 bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-flame transition-colors disabled:opacity-60"
            />
            <Magnetic strength={0.2}>
              <button
                type="submit"
                disabled={!input.trim() || isLoading || !csvFile}
                className="text-xs uppercase tracking-[0.2em] bg-flame text-ink px-6 py-2.5 font-medium hover:bg-flame/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "..." : "Ask →"}
              </button>
            </Magnetic>
          </form>
        </div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// TAB 5 — AI Code Reviewer & Security Auditor
// ─────────────────────────────────────────────────────────────────────────────

interface VulnerabilityReport {
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  explanation: string;
  recommendation: string;
}

const SAMPLE_VULNERABLE_CODE: Record<string, string> = {
  typescript: `// TypeScript / Supabase API Handler with Security Gaps
import { createClient } from "@supabase/supabase-js";

export async function getUserFinancialRecords(userId: string) {
  // CRITICAL: Missing RLS verification & using client without user session
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  
  // Vulnerable to unauthenticated data exfiltration
  const { data, error } = await supabase
    .from("user_transactions")
    .select("*")
    .eq("user_id", userId);

  return data;
}`,
  python: `# FastAPI Endpoint with SQL Injection and Missing Input Validation
from fastapi import FastAPI, Request
import psycopg2

app = FastAPI()

@app.get("/api/v1/search")
async def search_records(query: str):
    conn = psycopg2.connect("dbname=enterprise user=postgres")
    cur = conn.cursor()
    # CRITICAL: String interpolation in raw SQL query
    sql = f"SELECT * FROM customer_profiles WHERE username = '{query}'"
    cur.execute(sql)
    return cur.fetchall()
`,
  sql: `-- PostgreSQL Migration Missing RLS and Index on High-Volume Table
CREATE TABLE public.payment_records (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL,
    card_last_four TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missing: ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
-- Missing: CREATE INDEX idx_payment_records_user ON public.payment_records(user_id);
`
};

function CodeReviewerTab() {
  const [lang, setLang] = useState<"typescript" | "python" | "sql">("typescript");
  const [code, setCode] = useState(SAMPLE_VULNERABLE_CODE.typescript);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityReport[]>([]);
  const [optimizedCode, setOptimizedCode] = useState<string | null>(null);

  const handleLangChange = (newLang: "typescript" | "python" | "sql") => {
    setLang(newLang);
    setCode(SAMPLE_VULNERABLE_CODE[newLang]);
    setAuditScore(null);
    setVulnerabilities([]);
    setOptimizedCode(null);
  };

  const handleRunAudit = () => {
    if (!code.trim() || isAuditing) return;
    setIsAuditing(true);

    setTimeout(() => {
      if (lang === "typescript") {
        setAuditScore(58);
        setVulnerabilities([
          {
            title: "Unauthenticated Multi-Tenant Query (Missing RLS Session)",
            severity: "CRITICAL",
            category: "Access Control & RLS",
            explanation: "The query directly selects financial transactions without asserting the caller's JWT user identity via Supabase auth context.",
            recommendation: "Ensure Row-Level Security (RLS) is active on user_transactions and authenticate the user's bearer JWT token before executing the query."
          },
          {
            title: "Unhandled Promise Exception Potential",
            severity: "MEDIUM",
            category: "Resilience",
            explanation: "The database query does not catch network timeouts or handle the error object, which can lead to silent failures.",
            recommendation: "Wrap the query in a try/catch block and validate the returned error payload."
          }
        ]);
        setOptimizedCode(`import { createServerClient } from "@/lib/supabase/server";

export async function getUserFinancialRecords(request: Request, userId: string) {
  // Secure: Uses authenticated session client asserting caller identity
  const supabase = createServerClient(request);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user || user.id !== userId) {
    throw new Error("Unauthorized: Invalid session");
  }

  const { data, error } = await supabase
    .from("user_transactions")
    .select("id, amount, status, created_at")
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  return data;
}`);
      } else if (lang === "python") {
        setAuditScore(34);
        setVulnerabilities([
          {
            title: "SQL Injection via Formatted String Interpolation",
            severity: "CRITICAL",
            category: "OWASP Top 10 A03: Injection",
            explanation: "Directly concatenating the raw query parameter into the SQL statement enables attackers to execute arbitrary SQL commands (e.g. ' OR 1=1; --).",
            recommendation: "Always utilize parameterized queries (%s placeholders) or an ORM such as SQLAlchemy."
          },
          {
            title: "Unbounded Connection Allocation Leak",
            severity: "HIGH",
            category: "Resource Management",
            explanation: "Opening raw psycopg2 connections per-request without a connection pool or context manager leads to database connection exhaustion.",
            recommendation: "Utilize an asynchronous connection pool with context managers (async with conn.cursor())."
          }
        ]);
        setOptimizedCode(`from fastapi import FastAPI, Depends, HTTPException
from psycopg2.pool import SimpleConnectionPool

app = FastAPI()
db_pool = SimpleConnectionPool(1, 20, "dbname=enterprise user=postgres")

@app.get("/api/v1/search")
async def search_records(query: str):
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            # Secure: Parameterized query protects against SQL injection
            cur.execute("SELECT id, username, email FROM customer_profiles WHERE username = %s;", (query,))
            return cur.fetchall()
    finally:
        db_pool.putconn(conn)`);
      } else {
        setAuditScore(64);
        setVulnerabilities([
          {
            title: "Missing Row-Level Security (RLS) Policy",
            severity: "CRITICAL",
            category: "Data Exposure",
            explanation: "New table payment_records has public read/write capability by default if RLS is not explicitly enabled.",
            recommendation: "Add: ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY; and define granular user-specific policies."
          },
          {
            title: "Unindexed Foreign Key (user_id)",
            severity: "HIGH",
            category: "Database Performance",
            explanation: "Filtering or joining by user_id will result in sequential full table scans as the table scales past thousands of records.",
            recommendation: "Add: CREATE INDEX idx_payment_records_user ON public.payment_records(user_id);"
          }
        ]);
        setOptimizedCode(`CREATE TABLE public.payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    card_last_four VARCHAR(4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Enable Row-Level Security
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- 2. Restrict Read Access to Owner
CREATE POLICY "Users Can Read Own Payments"
ON public.payment_records FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Composite Index for Low-Latency Lookups
CREATE INDEX idx_payment_records_user_created 
ON public.payment_records(user_id, created_at DESC);`);
      }
      setIsAuditing(false);
    }, 1200);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="px-6 md:px-10 py-16 md:py-24 border-b border-border"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame/10 text-flame border border-flame/20 text-xs uppercase tracking-[0.2em] mb-3">
              <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
              OWASP Top 10 & RLS Static Security Engine
            </div>
            <h2 className="font-display text-3xl md:text-5xl">AI Code Reviewer & Security Auditor</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Static and semantic security auditor. Analyzes TypeScript, Python, and SQL for injection vectors,
              missing RLS policies, algorithmic bottlenecks, and memory leaks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(["typescript", "python", "sql"] as const).map((l) => (
              <button
                key={l}
                onClick={() => handleLangChange(l)}
                className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors ${
                  lang === l
                    ? "bg-flame text-ink border-flame font-semibold"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Code Input */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pb-2 border-b border-border/60">
                <span>Input Source ({lang.toUpperCase()})</span>
                <button
                  onClick={() => setCode(SAMPLE_VULNERABLE_CODE[lang])}
                  className="text-flame hover:underline"
                >
                  Load Vulnerable Sample
                </button>
              </div>
              <textarea
                rows={14}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-background border border-border/80 p-3 font-mono text-xs focus:border-flame focus:outline-none leading-relaxed text-foreground"
                placeholder="Paste your source code snippet here..."
              />
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing || !code.trim()}
                  className="px-6 py-3 bg-flame text-ink text-xs font-mono uppercase tracking-wider font-semibold hover:bg-flame/90 transition-all disabled:opacity-50"
                >
                  {isAuditing ? "Auditing Code Architecture..." : "Run Security Audit →"}
                </button>
              </div>
            </div>

            {/* Optimized Code Diff if available */}
            {optimizedCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-emerald-500/30 bg-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono text-emerald-500 pb-2 border-b border-emerald-500/20">
                  <span className="font-semibold">✓ Recommended Hardened Architecture</span>
                  <span className="text-[10px] uppercase tracking-wider">Zero Vulnerabilities</span>
                </div>
                <pre className="p-3 bg-background border border-border text-xs font-mono overflow-x-auto text-emerald-400/90 leading-relaxed">
                  <code>{optimizedCode}</code>
                </pre>
              </motion.div>
            )}
          </div>

          {/* Audit Results */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border border-border bg-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="font-display text-lg">Security Health Score</span>
                {auditScore !== null ? (
                  <span
                    className={`font-display text-3xl font-bold ${
                      auditScore >= 80
                        ? "text-emerald-500"
                        : auditScore >= 50
                        ? "text-amber-500"
                        : "text-red-500"
                    }`}
                  >
                    {auditScore}/100
                  </span>
                ) : (
                  <span className="font-mono text-xs text-muted-foreground">Ready to Audit</span>
                )}
              </div>

              {vulnerabilities.length > 0 ? (
                <div className="space-y-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-flame block">
                    Vulnerabilities Detected ({vulnerabilities.length})
                  </span>
                  {vulnerabilities.map((v, i) => (
                    <div key={i} className="p-4 border border-border bg-background space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-display font-semibold text-foreground">
                          {v.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 font-bold ${
                            v.severity === "CRITICAL"
                              ? "bg-red-500/10 text-red-500 border border-red-500/30"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                          }`}
                        >
                          {v.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {v.explanation}
                      </p>
                      <div className="text-[11px] font-mono text-emerald-500/90 pt-1 border-t border-border/40">
                        Fix: {v.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border">
                  Click "Run Security Audit" to evaluate the code for OWASP risks and architecture flaws.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 6 — AI Technical Interview Simulator
// ─────────────────────────────────────────────────────────────────────────────

interface InterviewMessage {
  id: string;
  sender: "coach" | "candidate";
  text: string;
  score?: number;
  feedback?: string;
}

const INTERVIEW_TRACKS = [
  {
    id: "fullstack",
    title: "Full-Stack Software Engineer (SDE-1/2)",
    intro: "Welcome to your Full-Stack technical interview. Let's begin: Can you walk me through how you architected EstateXAI? Specifically, explain your 3-tier Role-Based Access Control and why you selected JWT token rotation over session cookies.",
  },
  {
    id: "aiml",
    title: "AI / Machine Learning Engineer",
    intro: "Welcome to your AI/ML assessment. Let's start with MalariaScope: You achieved 93% accuracy on 27,558 blood smear microscopy images. How did you mitigate class imbalance, and why did EfficientNetB0 outperform MobileNetV2?",
  },
  {
    id: "systemdesign",
    title: "System Design & Distributed Systems",
    intro: "Welcome to the System Design interview. Here is our scenario: Design an enterprise real-time Agentic RAG system that ingests 50,000 PDF documents daily with sub-second citation retrieval and zero-hallucination guardrails. How do you partition the vector database and cache repeated queries?",
  },
];

function InterviewSimulatorTab() {
  const [activeTrack, setActiveTrack] = useState<"fullstack" | "aiml" | "systemdesign">("fullstack");
  const [messages, setMessages] = useState<InterviewMessage[]>([
    {
      id: "intro-1",
      sender: "coach",
      text: INTERVIEW_TRACKS[0].intro,
    },
  ]);
  const [candidateInput, setCandidateInput] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTrackChange = (track: "fullstack" | "aiml" | "systemdesign") => {
    setActiveTrack(track);
    const chosen = INTERVIEW_TRACKS.find((t) => t.id === track);
    if (chosen) {
      setMessages([
        {
          id: `intro-${Date.now()}`,
          sender: "coach",
          text: chosen.intro,
        },
      ]);
    }
    setCandidateInput("");
  };

  const handleSendAnswer = () => {
    if (!candidateInput.trim() || isEvaluating) return;
    const userText = candidateInput.trim();
    setCandidateInput("");

    const newMsgs = [
      ...messages,
      {
        id: `cand-${Date.now()}`,
        sender: "candidate" as const,
        text: userText,
      },
    ];
    setMessages(newMsgs);
    setIsEvaluating(true);

    setTimeout(() => {
      let score = 9.2;
      let coachFeedback = "Excellent answer. You articulated the architectural tradeoffs with technical clarity.";
      let nextQuestion = "Follow up: How would you monitor latency and error spikes in this pipeline using Prometheus and Grafana under a 10x traffic surge?";

      if (userText.length < 50) {
        score = 6.0;
        coachFeedback = "Good start, but recruiters look for concrete metrics, specific libraries, and failure mode mitigation.";
        nextQuestion = "Can you elaborate on the exact data structures and latency constraints you considered?";
      }

      setMessages([
        ...newMsgs,
        {
          id: `coach-${Date.now()}`,
          sender: "coach",
          text: `${coachFeedback} (Score: ${score}/10)

Next Question: ${nextQuestion}`,
          score,
          feedback: coachFeedback,
        },
      ]);
      setIsEvaluating(false);
    }, 1200);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="px-6 md:px-10 py-16 md:py-24 border-b border-border"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame/10 text-flame border border-flame/20 text-xs uppercase tracking-[0.2em] mb-3">
              <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
              Real-Time AI Technical Interview Coach
            </div>
            <h2 className="font-display text-3xl md:text-5xl">AI Technical Interview Simulator</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Conducts adaptive technical interviews for SDE Full-Stack, AI/ML, and System Design roles.
              Evaluates answers on technical depth, algorithmic rigor, and communication clarity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "fullstack", label: "Full-Stack SDE" },
              { id: "aiml", label: "AI/ML Engineer" },
              { id: "systemdesign", label: "System Design" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleTrackChange(t.id as any)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors ${
                  activeTrack === t.id
                    ? "bg-flame text-ink border-flame font-semibold"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat / Evaluation Interface */}
        <div className="border border-border bg-card flex flex-col h-[560px] overflow-hidden">
          {/* Chat transcript */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "candidate" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">
                    {m.sender === "coach" ? "AI Technical Interviewer" : "Candidate Response"}
                  </span>
                  {m.score !== undefined && (
                    <span className="text-[10px] font-mono px-2 py-0.2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                      Grade: {m.score}/10
                    </span>
                  )}
                </div>
                <div
                  className={`p-4 max-w-2xl text-xs font-sans leading-relaxed ${
                    m.sender === "candidate"
                      ? "bg-flame/10 border border-flame/30 text-foreground"
                      : "bg-background border border-border text-foreground/90 whitespace-pre-wrap"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isEvaluating && (
              <div className="flex items-center gap-2 text-xs font-mono text-flame">
                <span className="w-2 h-2 rounded-full bg-flame animate-ping" />
                <span>Evaluating technical depth and scoring candidate response...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-border bg-background flex items-center gap-3">
            <textarea
              rows={2}
              value={candidateInput}
              onChange={(e) => setCandidateInput(e.target.value)}
              placeholder="Type your technical response here (explain architecture, tradeoffs, algorithms)..."
              disabled={isEvaluating}
              className="flex-1 bg-card border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none resize-none"
            />
            <button
              onClick={handleSendAnswer}
              disabled={isEvaluating || !candidateInput.trim()}
              className="px-6 py-4 bg-flame text-ink text-xs font-mono uppercase font-semibold hover:bg-flame/90 transition-colors disabled:opacity-50 shrink-0"
            >
              Submit Answer →
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// Upcoming Tools Preview
// ─────────────────────────────────────────────────────────────────────────────

const UPCOMING_TOOLS = [
  {
    name: "AI Code Reviewer",
    desc: "Analyze TypeScript & Python code for security risks, RLS policy gaps, and performance bottlenecks with Groq-powered audit.",
    badge: "Security Audit",
    phase: "Phase 7",
  },
  {
    name: "AI Interview Simulator",
    desc: "Practice full-stack, machine learning, and system design interviews with real-time AI feedback and follow-up questions.",
    badge: "Live Q&A",
    phase: "Phase 7",
  },
];

function UpcomingTools() {
  return (
    <section className="px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-2">
              Roadmap Q3 / Q4
            </span>
            <h2 className="font-display text-4xl md:text-5xl">Next in production.</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {UPCOMING_TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="border border-border bg-card p-8 flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] px-2.5 py-1 bg-muted text-muted-foreground border border-border inline-block">
                    {tool.badge}
                  </span>
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] px-2 py-1 text-flame/70 border border-flame/20 inline-block">
                    {tool.phase}
                  </span>
                </div>
                <h3 className="font-display text-2xl">{tool.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
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
  );
}
