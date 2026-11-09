import { useState } from "react";

export interface ProductItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  status: "published" | "coming_soon" | "draft";
  badge: string;
  demoUrl?: string;
  githubUrl?: string;
}

export const initialProducts: ProductItem[] = [
  {
    id: "rag-portfolio-assistant",
    name: "RAG Portfolio Assistant",
    tagline: "Autonomous Knowledge Retrieval & Real-Time Q&A Agent",
    description:
      "Enterprise interactive RAG agent grounded in the AyushDevX knowledge base and vector embeddings. Delivers instant, cited answers about system architectures, technical skills, and engineering case studies.",
    features: [
      "Sub-second vector semantic search & retrieval",
      "Exact knowledge base chunk citations & references",
      "Streaming responses powered by Groq LLaMA 3.3 70B",
      "Zero-hallucination factual guardrails & context isolation",
    ],
    status: "published",
    badge: "Live · AI Lab Tool",
    demoUrl: "/ai-lab",
    githubUrl: "https://github.com/ayush0121n",
  },
  {
    id: "ai-pdf-chat-studio",
    name: "AI PDF Document Chat Studio",
    tagline: "Multi-Document Vector Query & Clause Analysis Engine",
    description:
      "Full-featured document intelligence product allowing researchers and engineers to upload or select technical whitepapers and query dense multi-page documentation with highlighted citations.",
    features: [
      "Multi-page PDF parsing, chunking & vector indexing",
      "Precise page number and paragraph citation tracking",
      "High-throughput low-latency inference via Groq",
      "Interactive sample library of engineering research papers",
    ],
    status: "published",
    badge: "Live · Document RAG",
    demoUrl: "/ai-lab",
    githubUrl: "https://github.com/ayush0121n/contract-rag-pipeline",
  },
  {
    id: "ai-resume-ats-matcher",
    name: "AI Resume & ATS Matcher Studio",
    tagline: "Deep NLP Job Compatibility & Keyword Gap Analyzer",
    description:
      "Production recruitment intelligence tool that evaluates developer resumes against target job descriptions, computes algorithmic match scores (0-100%), flags missing keywords, and drafts tailored improvements.",
    features: [
      "Real-time ATS keyword matching score (0-100%)",
      "Skill gap detection across AI/ML, Cloud & Full-Stack",
      "Action-verb and impact-metric revision suggestions",
      "Automated custom cover letter draft generation",
    ],
    status: "published",
    badge: "Live · NLP Engine",
    demoUrl: "/ai-lab",
    githubUrl: "https://github.com/ayush0121n",
  },
  {
    id: "ai-data-analyst-studio",
    name: "AI Data Analyst Studio",
    tagline: "No-Code Exploratory Data Analysis & CSV Intelligence",
    description:
      "Interactive data science product allowing users to drag and drop CSV datasets. Analyzes schema distributions, detects anomalies, answers complex statistical questions, and generates analytical narratives.",
    features: [
      "Drag-and-drop CSV ingestion & schema profiling",
      "Natural language exploratory data analysis (EDA)",
      "Automated summary statistics and trend identification",
      "Client-side secure processing with zero data retention",
    ],
    status: "published",
    badge: "Live · No-Code EDA",
    demoUrl: "/ai-lab",
    githubUrl: "https://github.com/ayush0121n",
  },
  {
    id: "ai-code-reviewer-studio",
    name: "AI Code Reviewer & Security Auditor",
    tagline: "Static & Semantic Code Analysis for Vulnerability Detection",
    description:
      "Intelligent code review tool auditing TypeScript, Python, and SQL for security risks, Row-Level Security (RLS) gaps, algorithmic complexity, and cloud architecture bottlenecks.",
    features: [
      "OWASP top-10 vulnerability & injection checks",
      "Supabase RLS & authentication security audit",
      "Time & space complexity analysis with refactor diffs",
      "Automated pull request summary generator",
    ],
    status: "coming_soon",
    badge: "Roadmap · Q3",
    demoUrl: "/ai-lab",
    githubUrl: "https://github.com/ayush0121n",
  },
  {
    id: "ai-interview-simulator",
    name: "AI Technical Interview Simulator",
    tagline: "Real-Time System Design & Coding Interview Coach",
    description:
      "Interactive voice and text interview simulator that conducts adaptive technical assessments for AI/ML, Full-Stack, and System Design roles with granular scoring and feedback rubric.",
    features: [
      "Dynamic adaptive questioning based on candidate responses",
      "System design diagram and architecture critique",
      "Granular feedback rubric across technical depth and communication",
      "Benchmarking against top tech industry standards",
    ],
    status: "coming_soon",
    badge: "Roadmap · Q4",
    demoUrl: "/ai-lab",
    githubUrl: "https://github.com/ayush0121n",
  },
];

const STORAGE_KEY = "ayushdevx_products_v2";

export function useProducts() {
  const [products, setProducts] = useState<ProductItem[]>(() => {
    if (typeof window === "undefined") return initialProducts;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load products from localStorage", e);
    }
    return initialProducts;
  });

  const saveProducts = (newProducts: ProductItem[]) => {
    setProducts(newProducts);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
      } catch (e) {
        console.error("Failed to save products to localStorage", e);
      }
    }
  };

  const addProduct = (prod: ProductItem) => {
    const updated = [prod, ...products];
    saveProducts(updated);
  };

  const updateProduct = (id: string, prod: ProductItem) => {
    const updated = products.map((p) => (p.id === id ? prod : p));
    saveProducts(updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
  };

  const resetProducts = () => {
    saveProducts(initialProducts);
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
  };
}
