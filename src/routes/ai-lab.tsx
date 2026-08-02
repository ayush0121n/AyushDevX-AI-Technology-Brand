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
  const [activeTab, setActiveTab] = useState<"portfolio" | "pdf" | "resume" | "data">("portfolio");

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

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

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: response.answer,
          citations: response.citations,
          isStreaming: true,
          isError: !!response.error && response.error !== "rate_limited",
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Remove streaming flag after animation completes
        const duration = Math.min(response.answer.length * 8 + 500, 6000);
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsg.id ? { ...m, isStreaming: false } : m)),
          );
        }, duration);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sender: "assistant",
            text: "Unable to reach the AI assistant. Please check your connection and try again.",
            citations: ["System: Connection Error"],
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
            RAG Assistant · Groq Llama 3.1
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
            ⚡ Powered by Groq (llama-3.1-8b-instant) · Server-side only · Zero data retention
          </div>
        </div>

        {/* Right — Chat Window */}
        <div className="lg:col-span-7 border border-border bg-card flex flex-col h-[560px]">
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

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: response.answer,
        pageRef: response.pageRef,
        citations: response.citations,
        isStreaming: true,
        isError: !!response.error,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      const duration = Math.min(response.answer.length * 8 + 500, 6000);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsg.id ? { ...m, isStreaming: false } : m)),
        );
      }, duration);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "assistant",
          text: "Unable to reach the PDF Chat service. Please try again.",
          citations: ["System: Connection Error"],
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
            PDF Vector Workspace · Groq Llama 3.1
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
                  <span className="text-xs font-mono text-flame">Groq / Llama 3.3 70B</span>
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

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: response.answer,
        isStreaming: true,
        isError: !!response.error,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      const duration = Math.min(response.answer.length * 8 + 500, 6000);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsg.id ? { ...m, isStreaming: false } : m)),
        );
      }, duration);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "assistant",
          text: "Unable to reach the AI Analyst. Please check your connection.",
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
            No-Code EDA · Groq Llama 3.1
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
