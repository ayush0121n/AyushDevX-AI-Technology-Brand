export interface FallbackInsight {
  id: string;
  slug: string;
  title: string;
  category: string;
  published_date: string;
  read_time: string;
  summary: string;
  tags: string[];
  featured: boolean;
}

export interface FallbackResource {
  id: string;
  title: string;
  description: string;
  category_id: string;
  storage_path: string | null;
  file_url: string | null;
  file_size: number;
  file_type: string;
  tags: string[];
  download_count: number;
  featured: boolean;
  created_at: string;
  resource_categories: { id: string; name: string; slug: string };
}

export interface FallbackBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  category: string;
  tags: string[];
  read_time_minutes: number;
  featured: boolean;
  created_at: string;
}

export const FALLBACK_INSIGHTS: FallbackInsight[] = [
  {
    id: "insight-1",
    slug: "production-agentic-rag-hybrid-search",
    title: "Engineering Enterprise Agentic RAG with Hybrid Dense-Sparse Vector Search",
    category: "AI Architecture",
    published_date: "2026-03-15T00:00:00Z",
    read_time: "8 min read",
    summary:
      "Deep dive into multi-hop retrieval, reciprocal rank fusion (RRF), and agentic validation loops using LangChain, Groq LLaMA 3.3, and Qdrant in production applications.",
    tags: ["RAG", "Vector Search", "LLMs", "Groq", "Python"],
    featured: true,
  },
  {
    id: "insight-2",
    slug: "high-throughput-microservices-fastapi-spring",
    title: "Architecting High-Throughput Microservices: FastAPI Async + Spring Boot Core",
    category: "Distributed Systems",
    published_date: "2026-02-28T00:00:00Z",
    read_time: "10 min read",
    summary:
      "Strategies for bridging low-latency asynchronous Python inference services with robust enterprise Java/Spring microservices using Redis pub/sub and gRPC.",
    tags: ["Microservices", "FastAPI", "Spring Boot", "gRPC", "Docker"],
    featured: true,
  },
  {
    id: "insight-3",
    slug: "multi-agent-autonomous-trading-systems",
    title: "Designing Multi-Agent Autonomous Systems for Real-Time Sentiment & Price Forecasts",
    category: "Agentic AI",
    published_date: "2026-02-10T00:00:00Z",
    read_time: "12 min read",
    summary:
      "How multi-agent consensus algorithms synthesize unstructured social sentiment feeds, financial news APIs, and technical indicators into actionable probabilities.",
    tags: ["Autonomous Agents", "FinTech", "NLP", "Machine Learning"],
    featured: false,
  },
  {
    id: "insight-4",
    slug: "computer-vision-edge-inference-medical-imaging",
    title: "Optimizing Deep Learning Vision Models for Low-Resource Edge Diagnostics",
    category: "Computer Vision",
    published_date: "2026-01-20T00:00:00Z",
    read_time: "7 min read",
    summary:
      "Practical distillation and ONNX runtime quantization of MobileNetV3 and YOLO architectures for reliable blood smear cell classification in field healthcare devices.",
    tags: ["Computer Vision", "Healthcare AI", "TensorFlow", "ONNX", "MobileNet"],
    featured: false,
  },
];

export const FALLBACK_RESOURCES: FallbackResource[] = [
  {
    id: "res-1",
    title: "Enterprise Agentic RAG System Architecture Blueprint",
    description:
      "A complete technical specification and architectural blueprint for building scalable, multi-modal Retrieval-Augmented Generation systems with verifiable citations.",
    category_id: "cat-ai",
    storage_path: null,
    file_url: "/resume/Ayush_Narkhede_Resume_2026.pdf",
    file_size: 2450000,
    file_type: "PDF",
    tags: ["RAG", "GenAI", "Architecture", "Vector DB"],
    download_count: 1420,
    featured: true,
    created_at: "2026-03-01T00:00:00Z",
    resource_categories: { id: "cat-ai", name: "AI & Machine Learning", slug: "ai-ml" },
  },
  {
    id: "res-2",
    title: "Full-Stack Microservices & Cloud-Native Security Standard",
    description:
      "Security checklist, JWT RBAC design, container isolation patterns, and zero-trust API gateway configurations for enterprise web applications.",
    category_id: "cat-backend",
    storage_path: null,
    file_url: "/resume/Ayush_Narkhede_Resume_2026.pdf",
    file_size: 1840000,
    file_type: "PDF",
    tags: ["Security", "Docker", "FastAPI", "Spring Boot"],
    download_count: 980,
    featured: false,
    created_at: "2026-02-15T00:00:00Z",
    resource_categories: { id: "cat-backend", name: "System Architecture", slug: "architecture" },
  },
  {
    id: "res-3",
    title: "AyushDevX Official Developer Profile & Master Credentials Guide",
    description:
      "Verified comprehensive record of Ayush Narkhede's 55+ industry certifications (OCI, ServiceNow, Microsoft, IBM, Google) and production tech stack portfolio.",
    category_id: "cat-profile",
    storage_path: null,
    file_url: "/resume/Ayush_Narkhede_Resume_2026.pdf",
    file_size: 1200000,
    file_type: "PDF",
    tags: ["Credentials", "Certifications", "Resume", "Profile"],
    download_count: 3200,
    featured: true,
    created_at: "2026-03-10T00:00:00Z",
    resource_categories: { id: "cat-profile", name: "Official Dossiers", slug: "dossiers" },
  },
];

export const FALLBACK_BLOG_POSTS: FallbackBlogPost[] = [
  {
    id: "blog-1",
    title: "Building Production-Grade Multi-Agent Systems in 2026",
    slug: "building-production-grade-multi-agent-systems",
    excerpt:
      "A pragmatic guide to structuring autonomous agents with human-in-the-loop controls, persistent memory, and deterministic tool schemas.",
    cover_image_url: "/projects/malariascope.png",
    category: "AI Engineering",
    tags: ["Agents", "LangChain", "Groq", "Python"],
    read_time_minutes: 6,
    featured: true,
    created_at: "2026-03-12T00:00:00Z",
  },
  {
    id: "blog-2",
    title: "Zero to Cloud: Enterprise Migration on Oracle Cloud (OCI)",
    slug: "zero-to-cloud-enterprise-migration-oci",
    excerpt:
      "Key lessons from architecting secure, resilient cloud infrastructure on OCI with automated Terraform pipelines and microservice orchestration.",
    cover_image_url: "/projects/estatexai.png",
    category: "Cloud Infrastructure",
    tags: ["OCI", "Cloud Architecture", "DevOps"],
    read_time_minutes: 7,
    featured: false,
    created_at: "2026-02-22T00:00:00Z",
  },
  {
    id: "blog-3",
    title: "From Convolution to Transformer: Modern Medical Imaging Models",
    slug: "from-convolution-to-transformer-medical-imaging",
    excerpt:
      "How Vision Transformers (ViT) and lightweight hybrid CNNs are transforming microscopic diagnostic workflows at fraction of traditional compute.",
    cover_image_url: "/projects/malariascope.png",
    category: "Healthcare AI",
    tags: ["Computer Vision", "ViT", "TensorFlow"],
    read_time_minutes: 9,
    featured: false,
    created_at: "2026-01-30T00:00:00Z",
  },
];

