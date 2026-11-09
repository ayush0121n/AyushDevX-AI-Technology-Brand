export const profile = {
  name: "Ayush Narkhede",
  brandName: "AyushDevX",
  role: "AI/ML Engineer & Full-Stack Developer",

  hero: {
    eyebrow: "AyushDevX",
    title: "Building Intelligent Digital Experiences with AI & Technology.",
    description:
      "AI/ML Engineer and Full-Stack Developer building intelligent applications, deep learning systems, and scalable digital products.",
    primaryCta: {
      label: "Explore AI Lab",
      href: "/ai-lab",
    },
    secondaryCta: {
      label: "View Projects",
      href: "/projects",
    },
  },

  about: {
    summary:
      "Oracle-certified AI/ML Engineer and MCA candidate specializing in Artificial Intelligence, with an 8.58 CGPA at Sri Balaji University, Pune. I build production-grade deep learning systems using TensorFlow, Keras, and CNN architectures, along with full-stack MERN applications. My work includes a malaria image-classification pipeline achieving 93% validation accuracy and AI-powered real estate and networking platforms. I also serve as Student Council President for the School of Computer Studies, representing more than 2,000 students, and hold industry certifications across Oracle, IBM, nasscom, and other platforms.",
  },

  contact: {
    email: "ayushgnarkhede0121@gmail.com",
    location: "Pune, Maharashtra, India",
    linkedin: "https://www.linkedin.com/in/ayush-narkhede-946638345",
    github: "https://github.com/ayush0121n",
  },

  skills: {
    aiMl: [
      "TensorFlow",
      "Keras",
      "Scikit-learn",
      "CNN",
      "EfficientNetB0",
      "MobileNetV2",
      "Transfer Learning",
      "Deep Learning",
      "LLMs",
      "NLP",
      "RAG",
      "Agentic AI",
    ],

    fullStack: [
      "React 18/19",
      "Node.js",
      "Express.js",
      "MongoDB",
      "MERN Stack",
      "REST API Design",
      "JWT Authentication",
      "Socket.IO",
      "Vite",
      "Tailwind CSS",
      "HTML5",
      "CSS3",
    ],

    languages: ["Python", "Java", "JavaScript", "TypeScript", "SQL", "C++"],

    dataCloud: [
      "NumPy",
      "Pandas",
      "Matplotlib",
      "ChromaDB",
      "Oracle Cloud Infrastructure",
      "Git",
      "GitHub",
      "Render",
      "Vercel",
      "Jupyter",
      "Google Colab",
    ],

    coreComputerScience: [
      "Data Structures and Algorithms",
      "Object-Oriented Programming",
      "Database Management Systems",
      "Operating Systems",
      "Computer Networks",
      "Software Development Life Cycle",
      "Agile",
      "MVC",
      "Scalable System Design",
    ],
  },

  projects: [
      {
          "title": "MalariaScope",
          "subtitle": "AI-Powered Malaria Microscopic Diagnosis System",
          "year": "2025",
          "slug": "malaria-detection",
          "category": "AI / ML",
          "technologies": [
              "Python",
              "TensorFlow",
              "Keras",
              "Flask",
              "CNN",
              "EfficientNetB0",
              "MobileNetV2"
          ],
          "githubUrl": "https://github.com/ayush0121n/malaria-detection",
          "description": "Deep learning image-classification system for rapid analysis of blood-smear microscopic images.",
          "details": "Benchmarked three CNN architectures (EfficientNetB0, MobileNetV2, custom CNN) on 27,558 NIH blood-smear images. EfficientNetB0 achieved 93% validation accuracy and a 0.97 ROC-AUC score, outperforming baseline models via transfer learning. Deployed as a Flask REST API microservice with automated diagnostic report generation.",
          "highlights": [
              "93% validation accuracy & 0.97 ROC-AUC",
              "Trained on 27,558 NIH blood smear microscopic images",
              "Sub-3-second inference with automated PDF reports",
              "Deployed REST API with transfer learning pipeline"
          ],
          "featured": true
      },
      {
          "title": "EstateXAI",
          "subtitle": "AI-Driven Real Estate & PG Discovery Platform",
          "year": "2025",
          "slug": "estatexai",
          "category": "Full-Stack",
          "technologies": [
              "MERN Stack",
              "React 18",
              "Node.js",
              "Express.js",
              "MongoDB",
              "JWT",
              "CI/CD"
          ],
          "githubUrl": "https://github.com/ayush0121n/estateXAI",
          "description": "Full-stack real estate and paying-guest discovery platform with 3-tier role-based access and AI recommendation.",
          "details": "Engineered a production-ready MERN application with 9 REST API endpoints covering property listings, geospatial search, and user analytics. Features 3-tier RBAC (Admin, Owner, User), 7-day rotating JWT authentication, and an AI recommendation engine increasing relevance by 40%.",
          "highlights": [
              "9 RESTful API endpoints with JWT authentication",
              "3-tier role-based access control (Admin, Owner, User)",
              "Geospatial property queries with MongoDB Atlas",
              "AI recommendation engine increasing conversion by 40%"
          ],
          "featured": true
      },
      {
          "title": "CrowdWisdom Trading Prediction AI Agent",
          "subtitle": "Market Sentiment & Algorithmic Trading Intelligence",
          "year": "2026",
          "slug": "crowdwisdomtrading-prediction-ai-agent-",
          "category": "AI / ML",
          "technologies": [
              "Python",
              "AI Agents",
              "Pandas",
              "Scikit-Learn",
              "Financial NLP",
              "Predictive Modeling"
          ],
          "githubUrl": "https://github.com/ayush0121n/crowdwisdomtrading-prediction-ai-agent-",
          "description": "Autonomous AI agent architecture engineered for financial prediction, crowd sentiment synthesis, and trading signal analysis.",
          "details": "Built a specialized AI prediction agent that aggregates crowd sentiment, market technical indicators, and historical price movements to forecast trading patterns. Employs modular agent pipelines to process unstructured financial text and generate high-confidence market signals.",
          "highlights": [
              "Automated financial data ingestion & sentiment analysis",
              "Autonomous trading agent decision-making pipeline",
              "Integration of crowd sentiment with technical indicators",
              "Modular Python architecture for backtesting and evaluation"
          ],
          "featured": true
      },
      {
          "title": "Contract RAG Pipeline",
          "subtitle": "Retrieval-Augmented Generation for Legal & Enterprise Documents",
          "year": "2026",
          "slug": "contract-rag-pipeline",
          "category": "AI / ML",
          "technologies": [
              "Python",
              "LangChain",
              "ChromaDB",
              "OpenAI / Claude API",
              "Vector Embeddings",
              "RAG"
          ],
          "githubUrl": "https://github.com/ayush0121n/contract-rag-pipeline",
          "description": "Agentic RAG pipeline specialized for indexing, semantically querying, and extracting obligations from complex legal contracts.",
          "details": "Retrieval-augmented extraction system that ingests PDF contracts, splits text into context-aware chunks, embeds documents into ChromaDB vector database, and executes semantic retrieval with LLM-powered verification. Achieves 85%+ answer relevance for clause extraction.",
          "highlights": [
              "Vector search indexing via ChromaDB embeddings",
              "Semantic clause and obligation extraction",
              "Sub-2-second context retrieval with high relevance",
              "Zero-hallucination citation verification pipeline"
          ],
          "featured": true
      },
      {
          "title": "ProConnect",
          "subtitle": "Real-Time Professional Collaboration Platform",
          "year": "2025",
          "slug": "proconnect",
          "category": "Full-Stack",
          "technologies": [
              "React 19",
              "TypeScript",
              "Node.js",
              "Express.js",
              "MongoDB",
              "Socket.IO",
              "JWT"
          ],
          "githubUrl": "https://github.com/ayush0121n/ProConnect",
          "description": "Full-stack professional networking platform featuring real-time Socket.IO messaging and atomic UI architecture.",
          "details": "Built with React 19, TypeScript, and Socket.IO for low-latency peer-to-peer messaging. Includes JWT authentication, scalable social graph schemas in MongoDB, and 20+ responsive components engineered with Atomic Design principles.",
          "highlights": [
              "Real-time bidirectional messaging via WebSockets (Socket.IO)",
              "20+ atomic design UI components in TypeScript",
              "Robust JWT auth and scalable social graph schemas",
              "Responsive layout optimized for mobile and desktop"
          ],
          "featured": true
      },
      {
          "title": "SafeBite AI",
          "subtitle": "AI-Powered Food Safety & Ingredient Analysis",
          "year": "2026",
          "slug": "safebiteai",
          "category": "AI / ML",
          "technologies": [
              "TypeScript",
              "Next.js",
              "Computer Vision",
              "AI Verification",
              "Tailwind CSS"
          ],
          "githubUrl": "https://github.com/ayush0121n/SafeBiteAi",
          "description": "Intelligent web platform analyzing food ingredients, detecting allergens, and providing personalized nutritional safety insights.",
          "details": "Leverages modern TypeScript and AI models to parse ingredient labels from food packaging, flag allergens, and generate health scores tailored to user dietary restrictions and sensitivities.",
          "highlights": [
              "Automated ingredient label parsing and allergen detection",
              "Personalized safety warnings based on dietary profiles",
              "Fast, accessible user interface built in modern Next.js"
          ],
          "featured": false
      },
      {
          "title": "Sales Analytics Dashboard",
          "subtitle": "Enterprise Real-Time Data Visualization System",
          "year": "2026",
          "slug": "sales-dashboard",
          "category": "Full-Stack",
          "technologies": [
              "TypeScript",
              "React",
              "Recharts",
              "Tailwind CSS",
              "Data Analytics"
          ],
          "githubUrl": "https://github.com/ayush0121n/sales-dashboard",
          "description": "Interactive data visualization dashboard delivering revenue analytics, KPI tracking, and sales forecasting.",
          "details": "Engineered an enterprise-ready dashboard featuring customizable chart layouts, dynamic filtering across date ranges, and modular visualization components built with Recharts and Tailwind CSS.",
          "highlights": [
              "Interactive data visualizations with Recharts",
              "Real-time KPI calculations and trend analysis",
              "High-performance client-side rendering in TypeScript"
          ],
          "featured": false
      },
      {
          "title": "FlyRank ML Production Pipeline",
          "subtitle": "Predictive Machine Learning Ranking Engine",
          "year": "2026",
          "slug": "flyrank-ml-assignment",
          "category": "AI / ML",
          "technologies": [
              "Python",
              "Jupyter",
              "Scikit-Learn",
              "Optuna",
              "NumPy",
              "Pandas"
          ],
          "githubUrl": "https://github.com/ayush0121n/flyrank-ml-assignment",
          "description": "End-to-end ML engineering workflow for predictive AI ranking models with automated hyperparameter optimization.",
          "details": "Engineered during the FlyRank ML engagement: covers extensive exploratory data analysis, feature engineering, Optuna-driven hyperparameter tuning, and cross-validation delivering a 12% boost in model precision.",
          "highlights": [
              "Automated feature engineering pipeline",
              "Hyperparameter optimization using Optuna",
              "Statistical benchmark evaluations (ROC-AUC, F1-Score)"
          ],
          "featured": false
      },
      {
          "title": "AyushDevX AI Technology Brand",
          "subtitle": "Next-Gen Portfolio & Interactive AI Showcase",
          "year": "2026",
          "slug": "ayushdevx-ai-technology-brand",
          "category": "Full-Stack",
          "technologies": [
              "TanStack Start",
              "React 19",
              "TypeScript",
              "Vite",
              "Tailwind CSS",
              "Framer Motion"
          ],
          "githubUrl": "https://github.com/ayush0121n/AyushDevX-AI-Technology-Brand",
          "description": "Personal technology brand and portfolio web application built with modern server-side rendering and interactive 3D UI.",
          "details": "Engineered with TanStack Start, React 19, and Tailwind CSS. Features dynamic routing, smooth scrolling, interactive certificate verification modal, and a full CMS administration dashboard.",
          "highlights": [
              "100% Google Lighthouse score in SEO & Accessibility",
              "SSR hydration with TanStack Start and Vite",
              "Integrated certificates repository with 56 verified assets"
          ],
          "featured": false
      }
  ],

  experience: [
    {
      role: "Trainee Full-Stack Developer",
      organization: "EBIZTECH",
      date: "Sep 2026 - Present",
      location: "Pune, MH",
      description:
        "Architecting and deploying scalable full-stack applications with React.js and Node.js, reducing frontend page load times by 25% and integrating microservices via CI/CD pipelines.",
      status: "Present",
    },
    {
      role: "Machine Learning Engineering Intern",
      organization: "FlyRank AI",
      date: "Jul 2026 – Sep 2026",
      location: "Remote",
      description:
        "Selected for FlyRank AI's Machine Learning Engineering Internship, a structured 12-week engagement focused on building and shipping ML-driven product features.",
      status: "Selected — Upcoming",
      publicationNote:
        "If this internship has not started, display it as Selected or Upcoming rather than completed experience.",
    },

    {
      role: "AI Research Intern",
      organization: "YuvaIntern",
      date: "Apr 2026 – Jun 2026",
      location: "Remote",
      description:
        "Selected for a competitive AI Research Internship focused on machine learning workflows, data preprocessing, model evaluation, and collaborative research workshops.",
      status: "Selected — Upcoming",
      publicationNote:
        "Update the status to Completed only after the internship has actually concluded.",
    },
  ],

  leadership: [
    {
      role: "Student Council President",
      organization: "School of Computer Studies, Sri Balaji University, Pune",
      date: "Jul 2025 – Present",
      description:
        "Elected to lead a student body of more than 2,000 students. Resolved academic welfare issues and directed technical events with cross-functional volunteers.",
      highlights: [
        "Represented more than 2,000 students",
        "Resolved 30+ academic welfare issues per semester",
        "Directed more than five technical fests",
        "Managed more than 30 cross-functional volunteers",
      ],
    },

    {
      role: "LinkedIn Campus Ambassador and NSS Volunteer",
      organization: "Sri Balaji University, Pune",
      date: "Oct 2025 – Present",
      description:
        "Supported LinkedIn Learning adoption among peers and contributed to community initiatives through NSS volunteering.",
      highlights: [
        "Reached more than 200 peers",
        "Contributed 120+ NSS volunteer hours",
        "Supported campus learning engagement",
      ],
    },
  ],

  education: [
    {
      degree: "Master of Computer Applications",
      specialization: "Artificial Intelligence",
      institution: "Sri Balaji University, Pune",
      result: "CGPA: 8.58/10.0",
      date: "Expected May 2027",
    },

    {
      degree: "Bachelor of Computer Applications",
      specialization: "",
      institution: "Sri Balaji University, Pune",
      result: "CGPA: 7.38/10.0 (73.8%)",
      date: "Completed 2025",
    },
  ],

  certifications: [
    "Microsoft & Founderz - Agent Architect Certified Professional (2026)",
    "ServiceNow - Virtual Internship: CSA Exam Prep, Agentic AI, Administration (2026)",
    "nasscom FutureSkills - Acquiring Data, Gold Category (92/100, Sep 2026)",
    "nasscom FutureSkills - Vibe Coding: AI Assisted Application Development (2026)",
    "Oracle Cloud Infrastructure (OCI) - Certified AI Foundations Associate (2025-26)",
    "Oracle Cloud Infrastructure (OCI) - Certified Data Science Professional (2025-26)",
    "Oracle Cloud Infrastructure (OCI) - Generative AI Professional (2025-26)",
    "Oracle Cloud Infrastructure (OCI) - Agentic AI Certified (2026)",
    "IBM SkillsBuild & AICTE - Data Analytics with AI Academic Internship (Aug 2026)",
    "Google & Coursera - Foundations of Cybersecurity Professional Certificate (Aug 2026)",
    "University of Michigan & Coursera - AI in Investment Technology (Sep 2026)",
    "HackerRank - Software Engineer Role Certificate",
    "HackerRank - Python, Java, SQL, Problem Solving",
    "Infosys Springboard - Full Stack Java Development",
    "Infosys Springboard - Principles of Generative AI & GPT-3 for Developers",
    "Infosys Springboard - Introduction to Natural Language Processing (NLP)",
    "Infosys Springboard - Deep Learning for Developers & Computer Vision 101",
    "Infosys Springboard - Prompt Engineering & Generative AI Unleashing",
    "Infosys Springboard - Agile Scrum in Practice & Robotic Process Automation",
    "Deloitte - Technology & Data Analytics Virtual Experience Programs",
  ],

  interests: [
    "Tech Content Creation",
    "Competitive Programming",
    "Open-Source Contribution",
    "AI Research",
    "Fitness and Gym",
  ],
} as const;


export interface CertificateGalleryItem {
  id: string;
  title: string;
  issuer: string;
  category: "AI & GenAI" | "Cloud & OCI" | "Full-Stack & Java" | "Assessments";
  date: string;
  image: string;
  badge?: string;
  pdf?: string;
}

export const certificateGallery: CertificateGalleryItem[] = [
  {
    id: "founderz-agent-architect",
    title: "Agent Architect Professional Certification",
    issuer: "Microsoft & Founderz",
    category: "AI & GenAI",
    date: "2026",
    image: "/certificates/Founderz_Microsoft_Agent_Architect.png",
    badge: "Agentic AI",
  },
  {
    id: "servicenow-csa",
    title: "ServiceNow Virtual Internship & CSA Preparation",
    issuer: "ServiceNow",
    category: "Cloud & OCI",
    date: "2026",
    image: "/certificates/ServiceNow_Virtual_Internship_CSA_Completion.png",
    badge: "ServiceNow",
  },
  {
    id: "nasscom-gold",
    title: "Acquiring Data - NSQF Level 5 (Gold Category, 92/100)",
    issuer: "nasscom FutureSkills",
    category: "Assessments",
    date: "Sep 2026",
    image: "/certificates/NASSCOM_Acquiring_Data_Assessment_Gold_page1.png",
    badge: "Gold Category (92/100)",
  },
  {
    id: "nasscom-vibe-coding",
    title: "Vibe Coding: AI Assisted Application Development",
    issuer: "nasscom FutureSkills",
    category: "AI & GenAI",
    date: "Sep 2026",
    image: "/certificates/NASSCOM_Vibe_Coding_AI_Assisted_App_Development_page1.png",
    badge: "AI-Assisted Dev",
  },
  {
    id: "oracle-ai-foundations",
    title: "OCI Certified AI Foundations Associate",
    issuer: "Oracle Cloud Infrastructure",
    category: "Cloud & OCI",
    date: "2025-2026",
    image: "/certificates/Oracle_OCI_AI_Foundations_Badge_1.jpeg",
    badge: "Oracle Certified",
  },
  {
    id: "oracle-data-science",
    title: "OCI Certified Data Science Professional",
    issuer: "Oracle Cloud Infrastructure",
    category: "Cloud & OCI",
    date: "2025-2026",
    image: "/certificates/Oracle_OCI_Data_Science_Badge_1.jpeg",
    badge: "Oracle Certified",
  },
  {
    id: "oracle-genai",
    title: "OCI Generative AI Professional",
    issuer: "Oracle Cloud Infrastructure",
    category: "AI & GenAI",
    date: "2025-2026",
    image: "/certificates/Oracle_OCI_Generative_AI_Badge_1.jpeg",
    badge: "Oracle Certified",
  },
  {
    id: "oracle-agentic",
    title: "OCI Agentic AI Specialist",
    issuer: "Oracle Cloud Infrastructure",
    category: "AI & GenAI",
    date: "2026",
    image: "/certificates/Oracle_OCI_Agentic_AI_Badge.jpeg",
    badge: "Oracle Certified",
  },
  {
    id: "ibm-skillsbuild-ai",
    title: "Data Analytics with AI Academic Internship",
    issuer: "IBM SkillsBuild & AICTE",
    category: "AI & GenAI",
    date: "Aug 2026",
    image: "/certificates/IBM_SkillsBuild_Data_Analytics_with_AI_AICTE.png",
    badge: "IBM & AICTE",
  },
  {
    id: "google-cybersecurity",
    title: "Foundations of Cybersecurity Professional",
    issuer: "Google / Coursera",
    category: "Assessments",
    date: "Aug 2026",
    image: "/certificates/Coursera_Google_Foundations_of_Cybersecurity.png",
    badge: "Google Career",
  },
  {
    id: "umich-ai-investment",
    title: "Innovations in Investment Technology: AI",
    issuer: "University of Michigan / Coursera",
    category: "AI & GenAI",
    date: "Sep 2026",
    image: "/certificates/Coursera_University_of_Michigan_AI_Investment_Technology.png",
    badge: "U-Michigan",
  },
  {
    id: "hackerrank-swe",
    title: "Software Engineer Role Certificate",
    issuer: "HackerRank",
    category: "Assessments",
    date: "2026",
    image: "/certificates/HackerRank_Software_Engineer_Role_Certificate_v1.png",
    badge: "Verified Role",
  },
  {
    id: "hackerrank-python",
    title: "Python Assessment Certificate",
    issuer: "HackerRank",
    category: "Assessments",
    date: "2026",
    image: "/certificates/HackerRank_Python_Certificate.png",
  },
  {
    id: "hackerrank-java",
    title: "Java Assessment Certificate",
    issuer: "HackerRank",
    category: "Assessments",
    date: "2026",
    image: "/certificates/HackerRank_Java_Certificate.png",
  },
  {
    id: "hackerrank-sql",
    title: "SQL Assessment Certificate",
    issuer: "HackerRank",
    category: "Assessments",
    date: "2026",
    image: "/certificates/HackerRank_SQL_Certificate.png",
  },
  {
    id: "hackerrank-problem-solving",
    title: "Problem Solving Certificate",
    issuer: "HackerRank",
    category: "Assessments",
    date: "2026",
    image: "/certificates/HackerRank_Problem_Solving_Certificate.png",
  },
  {
    id: "infosys-java-fullstack",
    title: "Full Stack Java Development",
    issuer: "Infosys Springboard",
    category: "Full-Stack & Java",
    date: "May 2026",
    image: "/certificates/Infosys_Springboard_Full_Stack_Java_Development.png",
    badge: "Infosys Certified",
  },
  {
    id: "infosys-genai-principles",
    title: "Principles of Generative AI",
    issuer: "Infosys Springboard",
    category: "AI & GenAI",
    date: "May 2026",
    image: "/certificates/Infosys_Springboard_Principles_of_Generative_AI.png",
  },
  {
    id: "infosys-gpt3-dev",
    title: "OpenAI GPT-3 for Developers",
    issuer: "Infosys Springboard",
    category: "AI & GenAI",
    date: "May 2026",
    image: "/certificates/Infosys_Springboard_OpenAI_GPT3_for_Developers.png",
  },
  {
    id: "infosys-nlp",
    title: "Introduction to Natural Language Processing",
    issuer: "Infosys Springboard",
    category: "AI & GenAI",
    date: "May 2026",
    image: "/certificates/Infosys_Springboard_Intro_to_NLP.png",
  },
  {
    id: "infosys-deep-learning",
    title: "Deep Learning for Developers",
    issuer: "Infosys Springboard",
    category: "AI & GenAI",
    date: "May 2026",
    image: "/certificates/Infosys_Springboard_Deep_Learning_for_Developers.png",
  },
  {
    id: "infosys-cv",
    title: "Computer Vision 101",
    issuer: "Infosys Springboard",
    category: "AI & GenAI",
    date: "May 2026",
    image: "/certificates/Infosys_Springboard_Computer_Vision_101.png",
  },
  {
    id: "infosys-prompt-eng",
    title: "Prompt Engineering Specialist",
    issuer: "Infosys Springboard",
    category: "AI & GenAI",
    date: "May 2026",
    image: "/certificates/Infosys_Springboard_Prompt_Engineering.png",
  },
  {
    id: "deloitte-tech",
    title: "Technology Virtual Experience Program",
    issuer: "Deloitte",
    category: "Assessments",
    date: "2026",
    image: "/certificates/Deloitte_Technology_Virtual_Internship.png",
  },
];
