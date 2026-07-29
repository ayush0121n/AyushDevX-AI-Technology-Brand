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
      title: "MalariaScope",
      subtitle: "AI-Powered Malaria Detection System",
      year: "2025",
      slug: "malariascope",
      category: "AI / ML",
      technologies: [
        "Python",
        "TensorFlow",
        "Keras",
        "Flask",
        "CNN",
        "EfficientNetB0",
        "MobileNetV2",
      ],
      githubUrl: "https://github.com/ayush0121n/malaria-detection",
      description:
        "A deep learning image-classification system for analyzing blood-smear images.",
      details:
        "Benchmarked three CNN architectures on 27,558 NIH blood-smear images. EfficientNetB0 achieved 93% validation accuracy and a 0.97 ROC-AUC, outperforming the baseline through transfer learning. The system was deployed as a Flask REST API with a drag-and-drop interface and automatically generated classification reports.",
      highlights: [
        "Benchmarked three CNN architectures",
        "Used transfer learning with EfficientNetB0",
        "Achieved 93% validation accuracy",
        "Achieved 0.97 ROC-AUC",
        "Deployed through a Flask REST API",
        "Inference time below three seconds",
      ],
      disclaimer:
        "This project is for research and educational purposes and is not a substitute for professional medical diagnosis.",
      licenseNote:
        "Open-sourced under MIT, subject to verification of the repository LICENSE file.",
      featured: true,
    },

    {
      title: "EstateXAI",
      subtitle: "AI-Driven Real Estate and PG Finder Platform",
      year: "2025",
      slug: "estatexai",
      category: "Full-Stack",
      technologies: [
        "MERN Stack",
        "React 18",
        "Node.js",
        "MongoDB",
        "JWT",
        "CI/CD",
      ],
      githubUrl: "https://github.com/ayush0121n/estateXAI",
      description:
        "A full-stack real estate and paying-guest discovery platform with role-based access and AI-powered recommendations.",
      details:
        "Group project completed by a team of three under the guidance of Prof. Debidutta Sharma. The platform includes Admin, Owner, and User roles, JWT authentication, MongoDB Atlas integration, listing management, geospatial filters, and admin analytics.",
      highlights: [
        "Implemented role-based access control",
        "Built JWT-based authentication",
        "Created RESTful APIs for listings and users",
        "Integrated MongoDB Atlas",
        "Added geospatial listing filters",
        "Implemented AI-based listing recommendations",
        "Configured Render and Vercel deployment",
      ],
      featured: true,
    },

    {
      title: "ProConnect",
      subtitle: "Professional Networking and Collaboration Platform",
      year: "2025",
      slug: "proconnect",
      category: "Full-Stack",
      technologies: [
        "React 19",
        "TypeScript",
        "Node.js",
        "Express.js",
        "MongoDB",
        "JWT",
        "Socket.IO",
      ],
      githubUrl: "https://github.com/ayush0121n/ai",
      description:
        "A full-stack networking platform with real-time communication and AI-assisted connection recommendations.",
      details:
        "Built a professional networking platform with JWT authentication, real-time Socket.IO messaging, REST APIs, and scalable MongoDB schemas for social graph data. Developed more than 20 TypeScript components using an Atomic Design approach.",
      highlights: [
        "Implemented JWT authentication",
        "Built real-time messaging with Socket.IO",
        "Created more than eight REST endpoints",
        "Developed 20+ TypeScript components",
        "Designed MongoDB schemas for social graph data",
        "Optimized for mobile viewports",
      ],
      verificationNote:
        "Verify the GitHub repository URL before publishing this project.",
      featured: true,
    },

    {
      title: "Agentic Document-Extraction Pipeline",
      subtitle: "Retrieval-Augmented Document Processing System",
      year: "2026",
      slug: "agentic-document-extraction-pipeline",
      category: "AI / ML",
      technologies: [
        "Python",
        "ChromaDB",
        "pdfplumber",
        "Claude API",
        "Agentic RAG",
      ],
      githubUrl: "https://github.com/ayush0121n",
      description:
        "An agentic RAG pipeline for extracting structured information from PDF documents.",
      details:
        "Built a 24-hour take-home agentic AI and RAG pipeline involving PDF parsing with pdfplumber, vector storage with ChromaDB, and a Claude API extraction agent. The workflow covers document ingestion, retrieval, structured extraction, and queryable output.",
      highlights: [
        "Implemented PDF text extraction",
        "Used ChromaDB for vector storage",
        "Built a retrieval-augmented workflow",
        "Created structured document extraction",
        "Connected document ingestion to queryable output",
      ],
      verificationNote:
        "Replace the GitHub profile URL with the exact project repository URL when available.",
      featured: false,
    },
  ],

  experience: [
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
    "Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate",
    "Oracle Cloud Infrastructure 2025 Certified Data Science Professional",
    "nasscom FutureSkills Prime — Experiential Learning, NSQF Level 5",
    "HackerRank — Software Engineer Certificate",
    "IBM SkillsBuild — Introduction to Large Language Models",
    "IBM SkillsBuild — Getting Started with Artificial Intelligence",
    "HP LIFE — AI for Beginners",
    "Simplilearn SkillUp — Getting Started with Full Stack Java Development",
    "Infosys Springboard — Introduction to Data Science",
    "nasscom FutureSkills — Acquiring Data",
    "UNICEF YuWaah Passport to Earning — Digital Productivity with AI",
  ],

  interests: [
    "Tech Content Creation",
    "Competitive Programming",
    "Open-Source Contribution",
    "AI Research",
    "Fitness and Gym",
  ],
} as const;
