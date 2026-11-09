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

export const initialCertificates: CertificateGalleryItem[] = [
  {
    "id": "cbse-secondary-school-marksheet-2020",
    "title": "CBSE Secondary School Marksheet 2020",
    "issuer": "CBSE",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/CBSE_Secondary_School_Marksheet_2020.png",
    "pdf": "/certificates/pdf/CBSE_Secondary_School_Marksheet_2020.pdf",
    "badge": null
  },
  {
    "id": "coursera-google-foundations-of-cybersecurity",
    "title": "Coursera Google Foundations of Cybersecurity",
    "issuer": "Google / Coursera",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/Coursera_Google_Foundations_of_Cybersecurity.png",
    "pdf": "/certificates/pdf/Coursera_Google_Foundations_of_Cybersecurity.pdf",
    "badge": null
  },
  {
    "id": "coursera-university-of-michigan-ai-investment-technology",
    "title": "Coursera University of Michigan AI Investment Technology",
    "issuer": "University of Michigan / Coursera",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Coursera_University_of_Michigan_AI_Investment_Technology.png",
    "pdf": "/certificates/pdf/Coursera_University_of_Michigan_AI_Investment_Technology.pdf",
    "badge": null
  },
  {
    "id": "deloitte-technology-virtual-internship",
    "title": "Deloitte Technology Virtual Internship",
    "issuer": "Deloitte",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/Deloitte_Technology_Virtual_Internship.png",
    "pdf": "/certificates/pdf/Deloitte_Technology_Virtual_Internship.pdf",
    "badge": null
  },
  {
    "id": "founderz-agent-architect-badge",
    "title": "Founderz Agent Architect Badge",
    "issuer": "Microsoft & Founderz",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Founderz_Agent_Architect_Badge.png",
    "pdf": "/certificates/pdf/Founderz_Agent_Architect_Badge.pdf",
    "badge": "Agentic AI"
  },
  {
    "id": "founderz-microsoft-agent-architect",
    "title": "Founderz Microsoft Agent Architect",
    "issuer": "Microsoft & Founderz",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Founderz_Microsoft_Agent_Architect.png",
    "pdf": "/certificates/pdf/Founderz_Microsoft_Agent_Architect.pdf",
    "badge": "Agentic AI"
  },
  {
    "id": "hackerrank-java-certificate",
    "title": "HackerRank Java Certificate",
    "issuer": "HackerRank",
    "category": "Full-Stack & Java",
    "date": "2025-2026",
    "image": "/certificates/HackerRank_Java_Certificate.png",
    "pdf": "/certificates/pdf/HackerRank_Java_Certificate.pdf",
    "badge": null
  },
  {
    "id": "hackerrank-problem-solving-certificate",
    "title": "HackerRank Problem Solving Certificate",
    "issuer": "HackerRank",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/HackerRank_Problem_Solving_Certificate.png",
    "pdf": "/certificates/pdf/HackerRank_Problem_Solving_Certificate.pdf",
    "badge": null
  },
  {
    "id": "hackerrank-python-certificate",
    "title": "HackerRank Python Certificate",
    "issuer": "HackerRank",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/HackerRank_Python_Certificate.png",
    "pdf": "/certificates/pdf/HackerRank_Python_Certificate.pdf",
    "badge": null
  },
  {
    "id": "hackerrank-sql-certificate",
    "title": "HackerRank SQL Certificate",
    "issuer": "HackerRank",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/HackerRank_SQL_Certificate.png",
    "pdf": "/certificates/pdf/HackerRank_SQL_Certificate.pdf",
    "badge": null
  },
  {
    "id": "hackerrank-software-engineer-certificate",
    "title": "HackerRank Software Engineer Certificate",
    "issuer": "HackerRank",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/HackerRank_Software_Engineer_Certificate.png",
    "pdf": "/certificates/pdf/HackerRank_Software_Engineer_Certificate.pdf",
    "badge": null
  },
  {
    "id": "hackerrank-software-engineer-role-certificate-v1",
    "title": "HackerRank Software Engineer Role Certificate v1",
    "issuer": "HackerRank",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/HackerRank_Software_Engineer_Role_Certificate_v1.png",
    "pdf": "/certificates/pdf/HackerRank_Software_Engineer_Role_Certificate_v1.pdf",
    "badge": "Verified Role"
  },
  {
    "id": "hackerrank-software-engineer-role-certificate-v2",
    "title": "HackerRank Software Engineer Role Certificate v2",
    "issuer": "HackerRank",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/HackerRank_Software_Engineer_Role_Certificate_v2.png",
    "pdf": "/certificates/pdf/HackerRank_Software_Engineer_Role_Certificate_v2.pdf",
    "badge": "Verified Role"
  },
  {
    "id": "ibm-skillsbuild-data-analytics-with-ai-aicte",
    "title": "IBM SkillsBuild Data Analytics with AI AICTE",
    "issuer": "IBM SkillsBuild & AICTE",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/IBM_SkillsBuild_Data_Analytics_with_AI_AICTE.png",
    "pdf": "/certificates/pdf/IBM_SkillsBuild_Data_Analytics_with_AI_AICTE.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-agile-scrum-in-practice",
    "title": "Infosys Springboard Agile Scrum in Practice",
    "issuer": "Infosys Springboard",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Agile_Scrum_in_Practice.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Agile_Scrum_in_Practice.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-artificial-intelligence",
    "title": "Infosys Springboard Artificial Intelligence",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Artificial_Intelligence.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Artificial_Intelligence.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-artificial-intelligence-primer",
    "title": "Infosys Springboard Artificial Intelligence Primer",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Artificial_Intelligence_Primer.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Artificial_Intelligence.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-css3",
    "title": "Infosys Springboard CSS3",
    "issuer": "Infosys Springboard",
    "category": "Full-Stack & Java",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_CSS3.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_CSS3.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-computer-vision-101",
    "title": "Infosys Springboard Computer Vision 101",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Computer_Vision_101.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Computer_Vision_101.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-deep-learning-for-developers",
    "title": "Infosys Springboard Deep Learning for Developers",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Deep_Learning_for_Developers.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Deep_Learning_for_Developers.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-full-stack-java-development",
    "title": "Infosys Springboard Full Stack Java Development",
    "issuer": "Infosys Springboard",
    "category": "Full-Stack & Java",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Full_Stack_Java_Development.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Full_Stack_Java_Development.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-generative-ai-unleashing",
    "title": "Infosys Springboard Generative AI Unleashing",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Generative_AI_Unleashing.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Generative_AI_Unleashing.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-generative-models-for-developers",
    "title": "Infosys Springboard Generative Models for Developers",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Generative_Models_for_Developers.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Generative_Models_for_Developers.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-html5-the-language",
    "title": "Infosys Springboard HTML5 The Language",
    "issuer": "Infosys Springboard",
    "category": "Full-Stack & Java",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_HTML5_The_Language.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_HTML5_The_Language.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-intro-to-artificial-intelligence",
    "title": "Infosys Springboard Intro to Artificial Intelligence",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Intro_to_Artificial_Intelligence.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Intro_to_Artificial_Intelligence.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-intro-to-data-science",
    "title": "Infosys Springboard Intro to Data Science",
    "issuer": "Infosys Springboard",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Intro_to_Data_Science.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Intro_to_Data_Science.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-intro-to-deep-learning",
    "title": "Infosys Springboard Intro to Deep Learning",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Intro_to_Deep_Learning.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Intro_to_Deep_Learning.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-intro-to-nlp",
    "title": "Infosys Springboard Intro to NLP",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Intro_to_NLP.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Intro_to_NLP.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-intro-to-openai-gpt-models",
    "title": "Infosys Springboard Intro to OpenAI GPT Models",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Intro_to_OpenAI_GPT_Models.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Intro_to_OpenAI_GPT_Models.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-intro-to-robotic-process-automation",
    "title": "Infosys Springboard Intro to Robotic Process Automation",
    "issuer": "Infosys Springboard",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Intro_to_Robotic_Process_Automation.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Intro_to_Robotic_Process_Automation.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-javascript",
    "title": "Infosys Springboard JavaScript",
    "issuer": "Infosys Springboard",
    "category": "Full-Stack & Java",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_JavaScript.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_JavaScript.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-openai-gpt3-for-developers",
    "title": "Infosys Springboard OpenAI GPT3 for Developers",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_OpenAI_GPT3_for_Developers.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_OpenAI_GPT3_for_Developers.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-principles-of-generative-ai",
    "title": "Infosys Springboard Principles of Generative AI",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Principles_of_Generative_AI.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Principles_of_Generative_AI.pdf",
    "badge": null
  },
  {
    "id": "infosys-springboard-prompt-engineering",
    "title": "Infosys Springboard Prompt Engineering",
    "issuer": "Infosys Springboard",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Infosys_Springboard_Prompt_Engineering.png",
    "pdf": "/certificates/pdf/Infosys_Springboard_Prompt_Engineering.pdf",
    "badge": null
  },
  {
    "id": "nasscom-acquiring-data-assessment-gold-page1",
    "title": "NASSCOM Acquiring Data Assessment Gold",
    "issuer": "nasscom FutureSkills",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/NASSCOM_Acquiring_Data_Assessment_Gold_page1.png",
    "pdf": "/certificates/pdf/NASSCOM_Acquiring_Data_Assessment_Gold.pdf",
    "badge": "Gold Category (92/100)"
  },
  {
    "id": "nasscom-acquiring-data-assessment-gold-page2",
    "title": "NASSCOM Acquiring Data Assessment Gold",
    "issuer": "nasscom FutureSkills",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/NASSCOM_Acquiring_Data_Assessment_Gold_page2.png",
    "pdf": "/certificates/pdf/NASSCOM_Acquiring_Data_Assessment_Gold.pdf",
    "badge": "Gold Category (92/100)"
  },
  {
    "id": "nasscom-futureskills-acquiring-data-certificate",
    "title": "NASSCOM FutureSkills Acquiring Data Certificate",
    "issuer": "nasscom FutureSkills",
    "category": "Assessments",
    "date": "2025-2026",
    "image": "/certificates/NASSCOM_FutureSkills_Acquiring_Data_Certificate.png",
    "pdf": "/certificates/pdf/NASSCOM_FutureSkills_Acquiring_Data_Certificate.pdf",
    "badge": null
  },
  {
    "id": "nasscom-futureskills-yuva-ai-for-all",
    "title": "NASSCOM FutureSkills Yuva AI for All",
    "issuer": "nasscom FutureSkills",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/NASSCOM_FutureSkills_Yuva_AI_for_All.png",
    "pdf": "/certificates/pdf/NASSCOM_FutureSkills_Yuva_AI_for_All.pdf",
    "badge": null
  },
  {
    "id": "nasscom-vibe-coding-ai-assisted-app-development-page1",
    "title": "NASSCOM Vibe Coding AI Assisted App Development",
    "issuer": "nasscom FutureSkills",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/NASSCOM_Vibe_Coding_AI_Assisted_App_Development_page1.png",
    "pdf": "/certificates/pdf/NASSCOM_Vibe_Coding_AI_Assisted_App_Development.pdf",
    "badge": null
  },
  {
    "id": "nasscom-vibe-coding-ai-assisted-app-development-page2",
    "title": "NASSCOM Vibe Coding AI Assisted App Development",
    "issuer": "nasscom FutureSkills",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/NASSCOM_Vibe_Coding_AI_Assisted_App_Development_page2.png",
    "pdf": "/certificates/pdf/NASSCOM_Vibe_Coding_AI_Assisted_App_Development.pdf",
    "badge": null
  },
  {
    "id": "oracle-cloud-certifications-bundle-page1",
    "title": "Oracle Cloud Certifications Bundle",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "Cloud & OCI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_Cloud_Certifications_Bundle_page1.png",
    "pdf": "/certificates/pdf/Oracle_Cloud_Certifications_Bundle.pdf",
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-cloud-certifications-bundle-page2",
    "title": "Oracle Cloud Certifications Bundle",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "Cloud & OCI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_Cloud_Certifications_Bundle_page2.png",
    "pdf": "/certificates/pdf/Oracle_Cloud_Certifications_Bundle.pdf",
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-ai-foundations-badge-1",
    "title": "Oracle OCI AI Foundations Badge 1",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_AI_Foundations_Badge_1.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-ai-foundations-badge-2",
    "title": "Oracle OCI AI Foundations Badge 2",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_AI_Foundations_Badge_2.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-ai-foundations-badge-3",
    "title": "Oracle OCI AI Foundations Badge 3",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_AI_Foundations_Badge_3.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-agentic-ai-badge",
    "title": "Oracle OCI Agentic AI Badge",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_Agentic_AI_Badge.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-cloud-infrastructure-badge-1",
    "title": "Oracle OCI Cloud Infrastructure Badge 1",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "Cloud & OCI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_Cloud_Infrastructure_Badge_1.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-cloud-infrastructure-badge-2",
    "title": "Oracle OCI Cloud Infrastructure Badge 2",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "Cloud & OCI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_Cloud_Infrastructure_Badge_2.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-data-science-badge-1",
    "title": "Oracle OCI Data Science Badge 1",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "Cloud & OCI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_Data_Science_Badge_1.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-data-science-badge-2",
    "title": "Oracle OCI Data Science Badge 2",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "Cloud & OCI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_Data_Science_Badge_2.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-data-science-badge-3",
    "title": "Oracle OCI Data Science Badge 3",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "Cloud & OCI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_Data_Science_Badge_3.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-generative-ai-badge-1",
    "title": "Oracle OCI Generative AI Badge 1",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_Generative_AI_Badge_1.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-generative-ai-badge-2",
    "title": "Oracle OCI Generative AI Badge 2",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_Generative_AI_Badge_2.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "oracle-oci-generative-ai-badge-3",
    "title": "Oracle OCI Generative AI Badge 3",
    "issuer": "Oracle Cloud Infrastructure",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/Oracle_OCI_Generative_AI_Badge_3.jpeg",
    "pdf": null,
    "badge": "Oracle OCI"
  },
  {
    "id": "servicenow-virtual-internship-csa-completion",
    "title": "ServiceNow Virtual Internship CSA Completion",
    "issuer": "ServiceNow",
    "category": "Cloud & OCI",
    "date": "2025-2026",
    "image": "/certificates/ServiceNow_Virtual_Internship_CSA_Completion.png",
    "pdf": "/certificates/pdf/ServiceNow_Virtual_Internship_CSA_Completion.pdf",
    "badge": "ServiceNow"
  },
  {
    "id": "yuvaintern-ai-research-intern-offer-letter",
    "title": "YuvaIntern AI Research Intern Offer Letter",
    "issuer": "YuvaIntern",
    "category": "AI & GenAI",
    "date": "2025-2026",
    "image": "/certificates/YuvaIntern_AI_Research_Intern_Offer_Letter.png",
    "pdf": "/certificates/pdf/YuvaIntern_AI_Research_Intern_Offer_Letter.pdf",
    "badge": null
  }
];
