import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCertificates } from "@/hooks/useCertificates";
import { useSiteData, EditableProject, EditableExperience } from "@/hooks/useSiteData";
import { useProducts, ProductItem } from "@/data/productsData";
import { CertificateGalleryItem } from "@/data/certificatesData";
import {
  Award,
  Layers,
  Briefcase,
  FolderGit2,
  FileText,
  User,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ExternalLink,
  RotateCcw,
  LogOut,
  Save,
  Download,
  Search,
  Sparkles,
  Package,
  Upload,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: MasterAdminPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — Master Admin Console" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type AdminSection =
  | "certificates"
  | "projects"
  | "products"
  | "experience"
  | "hero-about"
  | "skills"
  | "resume";

function MasterAdminPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>("certificates");
  const [adminEmail, setAdminEmail] = useState("ayushgnarkhede0121@gmail.com");

  // Authentication check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("ayushdevx_admin_auth");
      if (!isAuth) {
        navigate({ to: "/admin/login" });
      } else {
        const savedEmail = localStorage.getItem("ayushdevx_admin_email");
        if (savedEmail) setAdminEmail(savedEmail);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("ayushdevx_admin_auth");
    localStorage.removeItem("ayushdevx_admin_email");
    navigate({ to: "/admin/login" });
  };

  // Data Hooks
  const { certificates, addCertificate, deleteCertificate, resetToDefault: resetCerts } = useCertificates();
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProducts();
  const {
    data: siteData,
    updateHero,
    updateAbout,
    updateContact,
    updateSkills,
    addProject,
    updateProject,
    deleteProject,
    addExperience,
    updateExperience,
    deleteExperience,
    resetAllSiteData,
  } = useSiteData();

  // ─────────────────────────────────────────────────────────────
  // CERTIFICATES STATE
  // ─────────────────────────────────────────────────────────────
  const [certSearch, setCertSearch] = useState("");
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certCategory, setCertCategory] = useState<any>("AI & GenAI");
  const [certDate, setCertDate] = useState("2026");
  const [certBadge, setCertBadge] = useState("");
  const [certImage, setCertImage] = useState("");
  const [certPdf, setCertPdf] = useState("");

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle.trim() || !certIssuer.trim()) return;
    const newCert: CertificateGalleryItem = {
      id: "cert-" + Date.now(),
      title: certTitle.trim(),
      issuer: certIssuer.trim(),
      category: certCategory,
      date: certDate.trim() || "2026",
      image: certImage.trim() || "/certificates/Founderz_Microsoft_Agent_Architect.png",
      pdf: certPdf.trim() || undefined,
      badge: certBadge.trim() || undefined,
    };
    addCertificate(newCert);
    setCertTitle("");
    setCertIssuer("");
    setCertBadge("");
    setCertImage("");
    setCertPdf("");
    setShowAddCertModal(false);
  };

  const handleCertImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCertificates = certificates.filter(
    (c) =>
      c.title.toLowerCase().includes(certSearch.toLowerCase()) ||
      c.issuer.toLowerCase().includes(certSearch.toLowerCase()) ||
      (c.badge && c.badge.toLowerCase().includes(certSearch.toLowerCase()))
  );

  // ─────────────────────────────────────────────────────────────
  // PRODUCTS STATE
  // ─────────────────────────────────────────────────────────────
  const [editingProductIdx, setEditingProductIdx] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodTagline, setProdTagline] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodFeatures, setProdFeatures] = useState("");
  const [prodStatus, setProdStatus] = useState<"published" | "coming_soon" | "draft">("published");
  const [prodBadge, setProdBadge] = useState("AI Product");
  const [prodDemoUrl, setProdDemoUrl] = useState("/ai-lab");
  const [prodGithubUrl, setProdGithubUrl] = useState("");

  const openNewProductModal = () => {
    setEditingProductIdx(null);
    setProdName("");
    setProdTagline("");
    setProdDescription("");
    setProdFeatures("");
    setProdStatus("published");
    setProdBadge("AI Tool");
    setProdDemoUrl("/ai-lab");
    setProdGithubUrl("");
    setShowProductModal(true);
  };

  const openEditProductModal = (p: ProductItem) => {
    setEditingProductIdx(p.id);
    setProdName(p.name);
    setProdTagline(p.tagline);
    setProdDescription(p.description);
    setProdFeatures(p.features.join("\n"));
    setProdStatus(p.status);
    setProdBadge(p.badge);
    setProdDemoUrl(p.demoUrl || "");
    setProdGithubUrl(p.githubUrl || "");
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const productObj: ProductItem = {
      id: editingProductIdx || "prod-" + Date.now(),
      name: prodName.trim(),
      tagline: prodTagline.trim(),
      description: prodDescription.trim(),
      features: prodFeatures.split("\n").map((f) => f.trim()).filter(Boolean),
      status: prodStatus,
      badge: prodBadge.trim() || "AI Product",
      demoUrl: prodDemoUrl.trim() || undefined,
      githubUrl: prodGithubUrl.trim() || undefined,
    };

    if (editingProductIdx) {
      updateProduct(editingProductIdx, productObj);
    } else {
      addProduct(productObj);
    }
    setShowProductModal(false);
  };

  // ─────────────────────────────────────────────────────────────
  // PROJECTS STATE
  // ─────────────────────────────────────────────────────────────
  const [editingProjectIdx, setEditingProjectIdx] = useState<number | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projSubtitle, setProjSubtitle] = useState("");
  const [projYear, setProjYear] = useState("2026");
  const [projCategory, setProjCategory] = useState("AI / ML");
  const [projTech, setProjTech] = useState("");
  const [projGithub, setProjGithub] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projDetails, setProjDetails] = useState("");
  const [projHighlights, setProjHighlights] = useState("");
  const [projFeatured, setProjFeatured] = useState(true);

  const openNewProjectModal = () => {
    setEditingProjectIdx(null);
    setProjTitle("");
    setProjSubtitle("");
    setProjYear("2026");
    setProjCategory("AI / ML");
    setProjTech("");
    setProjGithub("");
    setProjDesc("");
    setProjDetails("");
    setProjHighlights("");
    setProjFeatured(true);
    setShowProjectModal(true);
  };

  const openEditProjectModal = (idx: number) => {
    const p = siteData.projects[idx];
    setEditingProjectIdx(idx);
    setProjTitle(p.title);
    setProjSubtitle(p.subtitle);
    setProjYear(p.year);
    setProjCategory(p.category);
    setProjTech(p.technologies.join(", "));
    setProjGithub(p.githubUrl);
    setProjDesc(p.description);
    setProjDetails(p.details);
    setProjHighlights(p.highlights.join("\n"));
    setProjFeatured(p.featured);
    setShowProjectModal(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    const projectObj: EditableProject = {
      title: projTitle.trim(),
      subtitle: projSubtitle.trim(),
      year: projYear.trim() || "2026",
      slug: projTitle.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      category: projCategory,
      technologies: projTech.split(",").map((t) => t.trim()).filter(Boolean),
      githubUrl: projGithub.trim(),
      description: projDesc.trim(),
      details: projDetails.trim(),
      highlights: projHighlights.split("\n").map((h) => h.trim()).filter(Boolean),
      featured: projFeatured,
    };

    if (editingProjectIdx !== null) {
      updateProject(editingProjectIdx, projectObj);
    } else {
      addProject(projectObj);
    }
    setShowProjectModal(false);
  };

  // ─────────────────────────────────────────────────────────────
  // EXPERIENCE STATE
  // ─────────────────────────────────────────────────────────────
  const [editingExpIdx, setEditingExpIdx] = useState<number | null>(null);
  const [showExpModal, setShowExpModal] = useState(false);
  const [expRole, setExpRole] = useState("");
  const [expOrg, setExpOrg] = useState("");
  const [expDate, setExpDate] = useState("");
  const [expLoc, setExpLoc] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [expStatus, setExpStatus] = useState("Present");

  const openNewExpModal = () => {
    setEditingExpIdx(null);
    setExpRole("");
    setExpOrg("");
    setExpDate("Sep 2026 – Present");
    setExpLoc("Pune, MH");
    setExpDesc("");
    setExpStatus("Present");
    setShowExpModal(true);
  };

  const openEditExpModal = (idx: number) => {
    const exp = siteData.experience[idx];
    setEditingExpIdx(idx);
    setExpRole(exp.role);
    setExpOrg(exp.organization);
    setExpDate(exp.date);
    setExpLoc(exp.location);
    setExpDesc(exp.description);
    setExpStatus(exp.status);
    setShowExpModal(true);
  };

  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expRole.trim() || !expOrg.trim()) return;
    const expObj: EditableExperience = {
      role: expRole.trim(),
      organization: expOrg.trim(),
      date: expDate.trim(),
      location: expLoc.trim(),
      description: expDesc.trim(),
      status: expStatus.trim(),
    };

    if (editingExpIdx !== null) {
      updateExperience(editingExpIdx, expObj);
    } else {
      addExperience(expObj);
    }
    setShowExpModal(false);
  };

  // ─────────────────────────────────────────────────────────────
  // HERO & ABOUT FORM STATE
  // ─────────────────────────────────────────────────────────────
  const [heroEyebrow, setHeroEyebrow] = useState(siteData.hero.eyebrow);
  const [heroTitle, setHeroTitle] = useState(siteData.hero.title);
  const [heroDesc, setHeroDesc] = useState(siteData.hero.description);
  const [aboutSummary, setAboutSummary] = useState(siteData.about.summary);
  const [contactEmail, setContactEmail] = useState(siteData.contact.email);
  const [contactLoc, setContactLoc] = useState(siteData.contact.location);
  const [contactLinkedin, setContactLinkedin] = useState(siteData.contact.linkedin);
  const [contactGithub, setContactGithub] = useState(siteData.contact.github);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const handleSaveHeroAbout = (e: React.FormEvent) => {
    e.preventDefault();
    updateHero({
      eyebrow: heroEyebrow,
      title: heroTitle,
      description: heroDesc,
    });
    updateAbout({
      summary: aboutSummary,
    });
    updateContact({
      email: contactEmail,
      location: contactLoc,
      linkedin: contactLinkedin,
      github: contactGithub,
    });
    setSaveSuccessMsg("Hero, About & Contact successfully saved and updated!");
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  // ─────────────────────────────────────────────────────────────
  // SKILLS STATE
  // ─────────────────────────────────────────────────────────────
  const [languagesStr, setLanguagesStr] = useState(siteData.skills.languages.join(", "));
  const [aiMlStr, setAiMlStr] = useState(siteData.skills.aiMl.join(", "));
  const [fullStackStr, setFullStackStr] = useState(siteData.skills.fullStack.join(", "));
  const [cloudStr, setCloudStr] = useState(siteData.skills.dataCloud.join(", "));

  // ── RESUME STATE ──
  const [liveResumeUrl, setLiveResumeUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ayushdevx_live_resume_url") || "/resume/Ayush_Narkhede_Resume_2026.pdf";
    }
    return "/resume/Ayush_Narkhede_Resume_2026.pdf";
  });
  const [resumeTitle, setResumeTitle] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ayushdevx_live_resume_title") || "Ayush Narkhede ATS Resume (A4)";
    }
    return "Ayush Narkhede ATS Resume (A4)";
  });
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        alert("Please upload a valid PDF document.");
        return;
      }
      setIsUploadingResume(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setLiveResumeUrl(dataUrl);
        setResumeTitle(file.name.replace(".pdf", ""));
        if (typeof window !== "undefined") {
          localStorage.setItem("ayushdevx_live_resume_url", dataUrl);
          localStorage.setItem("ayushdevx_live_resume_title", file.name.replace(".pdf", ""));
        }
        setIsUploadingResume(false);
        setSaveSuccessMsg("New Master Resume PDF successfully uploaded and activated!");
        setTimeout(() => setSaveSuccessMsg(""), 3500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveResumeUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveResumeUrl.trim()) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("ayushdevx_live_resume_url", liveResumeUrl.trim());
      localStorage.setItem("ayushdevx_live_resume_title", resumeTitle.trim());
    }
    setSaveSuccessMsg("Resume URL and title successfully updated!");
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  const handleResetResume = () => {
    if (confirm("Reset resume to the standard default 2026 ATS PDF?")) {
      const defaultUrl = "/resume/Ayush_Narkhede_Resume_2026.pdf";
      const defaultTitle = "Ayush Narkhede ATS Resume (A4)";
      setLiveResumeUrl(defaultUrl);
      setResumeTitle(defaultTitle);
      if (typeof window !== "undefined") {
        localStorage.setItem("ayushdevx_live_resume_url", defaultUrl);
        localStorage.setItem("ayushdevx_live_resume_title", defaultTitle);
      }
      setSaveSuccessMsg("Resume reset to default 2026 PDF.");
      setTimeout(() => setSaveSuccessMsg(""), 3500);
    }
  };

  const handleSaveSkills = (e: React.FormEvent) => {
    e.preventDefault();
    updateSkills({
      languages: languagesStr.split(",").map((s) => s.trim()).filter(Boolean),
      aiMl: aiMlStr.split(",").map((s) => s.trim()).filter(Boolean),
      fullStack: fullStackStr.split(",").map((s) => s.trim()).filter(Boolean),
      dataCloud: cloudStr.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setSaveSuccessMsg("Skills successfully saved and updated!");
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-flame/10 text-flame">
            <Layers className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl tracking-tight">AyushDevX</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                Full Control Active
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Signed in as: {adminEmail}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border hover:border-foreground transition-colors"
          >
            <span>Live Website</span>
            <ExternalLink className="size-3" />
          </a>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white transition-colors"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-r border-border bg-card/30 p-4 md:p-6 space-y-1 shrink-0">
          <div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground mb-3 px-3">
            Management Modules
          </div>

          {[
            { id: "certificates", label: "Certificates & Licences", icon: Award, count: certificates.length },
            { id: "products", label: "Products & Tools", icon: Package, count: products.length },
            { id: "projects", label: "Projects & GitHub", icon: FolderGit2, count: siteData.projects.length },
            { id: "experience", label: "Work Experience", icon: Briefcase, count: siteData.experience.length },
            { id: "hero-about", label: "Hero & Bio Profile", icon: User },
            { id: "skills", label: "Skills & Tech Stack", icon: Sparkles },
            { id: "resume", label: "Master Resume (PDF)", icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AdminSection)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider transition-all border ${
                  isActive
                    ? "bg-flame text-ink border-flame font-semibold shadow-sm"
                    : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-ink/20 text-ink" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 mt-6 border-t border-border/60">
            <button
              onClick={() => {
                if (confirm("Reset all customizations to standard default data?")) {
                  resetAllSiteData();
                  resetCerts();
                  resetProducts();
                  alert("Restored to default values!");
                }
              }}
              className="w-full py-2 px-3 text-[11px] font-mono uppercase text-muted-foreground/80 hover:text-destructive border border-border/60 hover:border-destructive/40 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset All to Default</span>
            </button>
          </div>
        </aside>

        {/* Content View Area */}
        <section className="flex-1 p-6 md:p-10 overflow-y-auto">
          {saveSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-500 text-xs font-mono flex items-center gap-2"
            >
              <Check className="size-4" />
              <span>{saveSuccessMsg}</span>
            </motion.div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 1: CERTIFICATES & LICENCES */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeSection === "certificates" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-border gap-4">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl">Certificates & Licences</h2>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Manage all {certificates.length} digital badges, PDFs, and verification credentials.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddCertModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-flame text-ink text-xs font-mono uppercase font-semibold hover:bg-flame/90 transition-colors"
                  >
                    <Plus className="size-4" />
                    <span>Add Certificate</span>
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={certSearch}
                  onChange={(e) => setCertSearch(e.target.value)}
                  placeholder="Search certificates..."
                  className="w-full bg-card border border-border pl-9 pr-4 py-2 text-xs font-mono focus:border-flame focus:outline-none"
                />
              </div>

              {/* Table / Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="border border-border bg-card p-4 flex flex-col justify-between hover:border-flame/50 transition-colors"
                  >
                    <div>
                      <div className="aspect-[16/10] bg-muted/30 border border-border/50 mb-3 overflow-hidden flex items-center justify-center p-2">
                        <img src={cert.image} alt={cert.title} className="max-h-full object-contain" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
                        <span>{cert.issuer}</span>
                        <span>{cert.date}</span>
                      </div>
                      <h4 className="font-display text-sm leading-snug line-clamp-2">{cert.title}</h4>
                      {cert.badge && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-flame/10 text-flame border border-flame/20 text-[10px] font-mono">
                          {cert.badge}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground">{cert.category}</span>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${cert.title}"?`)) {
                            deleteCertificate(cert.id);
                          }
                        }}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 2: PRODUCTS & TOOLS */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeSection === "products" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-border gap-4">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl">Products & Tools Management</h2>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Manage all digital software products, AI tools, and roadmap items displayed on /products.
                  </p>
                </div>
                <button
                  onClick={openNewProductModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-flame text-ink text-xs font-mono uppercase font-semibold hover:bg-flame/90 transition-colors"
                >
                  <Plus className="size-4" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="space-y-4">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="border border-border bg-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-flame/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-flame/10 text-flame border border-flame/20 uppercase font-semibold">
                          {prod.badge}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
                            prod.status === "published"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}
                        >
                          {prod.status}
                        </span>
                      </div>
                      <h3 className="font-display text-xl">{prod.name}</h3>
                      <p className="text-xs font-mono text-flame mt-0.5">{prod.tagline}</p>
                      <p className="text-xs text-muted-foreground mt-2 max-w-2xl">{prod.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {prod.features.map((f) => (
                          <span key={f} className="text-[10px] font-mono px-2 py-0.5 bg-muted text-muted-foreground">
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditProductModal(prod)}
                        className="p-2 border border-border hover:border-foreground text-xs font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="size-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete product "${prod.name}"?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-2 border border-destructive/40 text-destructive hover:bg-destructive hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 3: PROJECTS */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeSection === "projects" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-border gap-4">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl">Projects Showcase</h2>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Manage portfolio projects, tech stacks, GitHub repositories, and AI demos.
                  </p>
                </div>
                <button
                  onClick={openNewProjectModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-flame text-ink text-xs font-mono uppercase font-semibold hover:bg-flame/90 transition-colors"
                >
                  <Plus className="size-4" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="space-y-4">
                {siteData.projects.map((proj, idx) => (
                  <div
                    key={proj.slug + idx}
                    className="border border-border bg-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-flame/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-flame/10 text-flame border border-flame/20 uppercase">
                          {proj.category}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">{proj.year}</span>
                        {proj.featured && (
                          <span className="text-[10px] font-mono text-emerald-500 font-medium">★ Featured</span>
                        )}
                      </div>
                      <h3 className="font-display text-xl">{proj.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{proj.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {proj.technologies.map((t) => (
                          <span key={t} className="text-[10px] font-mono px-2 py-0.5 bg-muted text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditProjectModal(idx)}
                        className="p-2 border border-border hover:border-foreground text-xs font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="size-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete project "${proj.title}"?`)) {
                            deleteProject(idx);
                          }
                        }}
                        className="p-2 border border-destructive/40 text-destructive hover:bg-destructive hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 4: WORK EXPERIENCE */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeSection === "experience" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-border gap-4">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl">Work Experience & Internships</h2>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Manage work roles, companies, dates, and responsibilities.
                  </p>
                </div>
                <button
                  onClick={openNewExpModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-flame text-ink text-xs font-mono uppercase font-semibold hover:bg-flame/90 transition-colors"
                >
                  <Plus className="size-4" />
                  <span>Add Experience</span>
                </button>
              </div>

              <div className="space-y-4">
                {siteData.experience.map((exp, idx) => (
                  <div
                    key={exp.role + idx}
                    className="border border-border bg-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-flame/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 text-xs font-mono text-muted-foreground">
                        <span className="font-semibold text-foreground">{exp.organization}</span>
                        <span>•</span>
                        <span>{exp.location}</span>
                        <span>•</span>
                        <span className="text-flame">{exp.date}</span>
                      </div>
                      <h3 className="font-display text-lg">{exp.role}</h3>
                      <p className="text-xs text-muted-foreground mt-2 max-w-2xl">{exp.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditExpModal(idx)}
                        className="p-2 border border-border hover:border-foreground text-xs font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="size-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete experience "${exp.role}" at ${exp.organization}?`)) {
                            deleteExperience(idx);
                          }
                        }}
                        className="p-2 border border-destructive/40 text-destructive hover:bg-destructive hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 5: HERO & ABOUT BIO */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeSection === "hero-about" && (
            <div className="max-w-3xl">
              <div className="pb-6 mb-6 border-b border-border">
                <h2 className="font-display text-2xl md:text-3xl">Hero, Bio & Contact Info</h2>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Customize the main headline, biography statement, location, and social links.
                </p>
              </div>

              <form onSubmit={handleSaveHeroAbout} className="space-y-6">
                <div className="border border-border bg-card p-6 space-y-4">
                  <h3 className="font-display text-lg border-b border-border/60 pb-2">Hero Section</h3>

                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Eyebrow Brand</label>
                    <input
                      type="text"
                      value={heroEyebrow}
                      onChange={(e) => setHeroEyebrow(e.target.value)}
                      className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Hero Main Title</label>
                    <input
                      type="text"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Hero Sub-description</label>
                    <textarea
                      rows={2}
                      value={heroDesc}
                      onChange={(e) => setHeroDesc(e.target.value)}
                      className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border border-border bg-card p-6 space-y-4">
                  <h3 className="font-display text-lg border-b border-border/60 pb-2">About Bio Summary</h3>
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Full Summary</label>
                    <textarea
                      rows={5}
                      value={aboutSummary}
                      onChange={(e) => setAboutSummary(e.target.value)}
                      className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border border-border bg-card p-6 space-y-4">
                  <h3 className="font-display text-lg border-b border-border/60 pb-2">Contact & Socials</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase mb-1">Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase mb-1">Location</label>
                      <input
                        type="text"
                        value={contactLoc}
                        onChange={(e) => setContactLoc(e.target.value)}
                        className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        value={contactLinkedin}
                        onChange={(e) => setContactLinkedin(e.target.value)}
                        className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase mb-1">GitHub URL</label>
                      <input
                        type="url"
                        value={contactGithub}
                        onChange={(e) => setContactGithub(e.target.value)}
                        className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-flame text-ink text-xs font-mono uppercase font-semibold hover:bg-flame/90 transition-colors"
                  >
                    <Save className="size-4" />
                    <span>Save All Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 6: SKILLS & TECH STACK */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeSection === "skills" && (
            <div className="max-w-3xl">
              <div className="pb-6 mb-6 border-b border-border">
                <h2 className="font-display text-2xl md:text-3xl">Technical Skills & Categories</h2>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Comma-separated list of technologies and skills displayed across the site.
                </p>
              </div>

              <form onSubmit={handleSaveSkills} className="space-y-5">
                <div className="border border-border bg-card p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1 font-semibold">
                      Programming Languages
                    </label>
                    <input
                      type="text"
                      value={languagesStr}
                      onChange={(e) => setLanguagesStr(e.target.value)}
                      className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase mb-1 font-semibold">
                      AI, ML & Generative AI
                    </label>
                    <textarea
                      rows={3}
                      value={aiMlStr}
                      onChange={(e) => setAiMlStr(e.target.value)}
                      className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase mb-1 font-semibold">
                      Full-Stack & Backend
                    </label>
                    <textarea
                      rows={3}
                      value={fullStackStr}
                      onChange={(e) => setFullStackStr(e.target.value)}
                      className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase mb-1 font-semibold">
                      Cloud, Data & Databases
                    </label>
                    <textarea
                      rows={3}
                      value={cloudStr}
                      onChange={(e) => setCloudStr(e.target.value)}
                      className="w-full bg-background border border-border p-2.5 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-flame text-ink text-xs font-mono uppercase font-semibold hover:bg-flame/90 transition-colors"
                  >
                    <Save className="size-4" />
                    <span>Save Skills Matrix</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 7: RESUME */}
          {activeSection === "resume" && (
            <div className="max-w-4xl">
              <div className="pb-6 mb-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl">Master Resume Management</h2>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Add, update, replace, or delete your ATS-optimized Master Resume PDF for recruiter downloads.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={liveResumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-flame text-ink text-xs font-mono uppercase font-semibold hover:bg-flame/90 transition-colors"
                  >
                    <Download className="size-4" />
                    <span>Download Live PDF</span>
                  </a>
                  <button
                    onClick={handleResetResume}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-border hover:border-foreground text-xs font-mono uppercase text-muted-foreground hover:text-foreground transition-colors"
                    title="Reset to default PDF"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Management Controls: Upload & URL update */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Upload New PDF File */}
                <div className="border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="size-4 text-flame" />
                    <h3 className="font-display text-base">Upload New Resume PDF</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select a local PDF file to immediately replace the active resume across the website.
                  </p>
                  <label className="block w-full border-2 border-dashed border-border hover:border-flame/60 p-6 text-center cursor-pointer transition-colors bg-background">
                    <span className="text-xs font-mono text-flame block mb-1">
                      {isUploadingResume ? "Uploading PDF..." : "Click to select new PDF file"}
                    </span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      Accepts standard PDF (Max 10MB)
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleResumeFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Edit Resume Meta & URL */}
                <form onSubmit={handleSaveResumeUrl} className="border border-border bg-card p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Edit3 className="size-4 text-flame" />
                      <h3 className="font-display text-base">Resume Link & Metadata</h3>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase mb-1">Document Title / Label</label>
                      <input
                        type="text"
                        value={resumeTitle}
                        onChange={(e) => setResumeTitle(e.target.value)}
                        className="w-full bg-background border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase mb-1">Live URL Path</label>
                      <input
                        type="text"
                        value={liveResumeUrl}
                        onChange={(e) => setLiveResumeUrl(e.target.value)}
                        placeholder="/resume/Ayush_Narkhede_Resume_2026.pdf"
                        className="w-full bg-background border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-flame text-ink text-xs font-mono uppercase font-semibold hover:bg-flame/90"
                    >
                      <Save className="size-3.5" />
                      <span>Save URL</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Resume Preview */}
              <div className="border border-border bg-card p-6">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-flame" />
                    <span className="font-display text-base">{resumeTitle}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    Active Live
                  </span>
                </div>
                <div className="aspect-[1/1.4] w-full max-w-2xl mx-auto border border-border/80 overflow-hidden bg-muted/20">
                  <iframe
                    src={`${liveResumeUrl}#toolbar=0`}
                    title="Resume Preview"
                    className="size-full"
                  />
                </div>
              </div>
            </div>          )}
        </section>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD CERTIFICATE */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddCertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddCertModal(false)}
            className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full bg-background border border-border p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <h3 className="font-display text-xl">Add New Certificate</h3>
                <button onClick={() => setShowAddCertModal(false)}>
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleAddCert} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    placeholder="e.g. Oracle Cloud Infrastructure 2026 Specialist"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Issuer / Organization</label>
                  <input
                    type="text"
                    required
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    placeholder="e.g. Oracle, Microsoft, ServiceNow, Google"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Category</label>
                    <select
                      value={certCategory}
                      onChange={(e) => setCertCategory(e.target.value)}
                      className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                    >
                      <option value="AI & GenAI">AI & GenAI</option>
                      <option value="Cloud & OCI">Cloud & OCI</option>
                      <option value="Full-Stack & Java">Full-Stack & Java</option>
                      <option value="Assessments">Assessments</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Date</label>
                    <input
                      type="text"
                      value={certDate}
                      onChange={(e) => setCertDate(e.target.value)}
                      className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Badge (Optional)</label>
                  <input
                    type="text"
                    value={certBadge}
                    onChange={(e) => setCertBadge(e.target.value)}
                    placeholder="e.g. Certified, Gold Level"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCertImageUpload}
                    className="w-full bg-card border border-border p-2 text-xs font-mono file:mr-2 file:py-1 file:px-2 file:border-0 file:bg-flame file:text-ink font-mono"
                  />
                  {certImage && (
                    <div className="mt-2 h-20 bg-muted/20 p-2 flex items-center justify-center border border-border">
                      <img src={certImage} alt="Preview" className="max-h-full object-contain" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">PDF Link (Optional)</label>
                  <input
                    type="text"
                    value={certPdf}
                    onChange={(e) => setCertPdf(e.target.value)}
                    placeholder="/certificates/pdf/sample.pdf"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCertModal(false)}
                    className="px-4 py-2 text-xs font-mono uppercase border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-mono uppercase bg-flame text-ink font-semibold"
                  >
                    Save Certificate
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProductModal(false)}
            className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-xl w-full bg-background border border-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <h3 className="font-display text-xl">
                  {editingProductIdx ? "Edit Product" : "Add New Product"}
                </h3>
                <button onClick={() => setShowProductModal(false)}>
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Agentic RAG Engine"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Tagline</label>
                  <input
                    type="text"
                    value={prodTagline}
                    onChange={(e) => setProdTagline(e.target.value)}
                    placeholder="e.g. Autonomous Document Intelligence Pipeline"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Status</label>
                    <select
                      value={prodStatus}
                      onChange={(e) => setProdStatus(e.target.value as any)}
                      className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                    >
                      <option value="published">Published (Available)</option>
                      <option value="coming_soon">Coming Soon / Roadmap</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Badge</label>
                    <input
                      type="text"
                      value={prodBadge}
                      onChange={(e) => setProdBadge(e.target.value)}
                      placeholder="e.g. Production Ready, Live Beta"
                      className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    placeholder="Describe what the product does and why it is valuable..."
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">
                    Features (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={prodFeatures}
                    onChange={(e) => setProdFeatures(e.target.value)}
                    placeholder="Sub-2-second vector retrieval&#10;Zero-hallucination guardrails"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Demo / Launch URL</label>
                    <input
                      type="text"
                      value={prodDemoUrl}
                      onChange={(e) => setProdDemoUrl(e.target.value)}
                      placeholder="/ai-lab or external link"
                      className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">GitHub Source URL</label>
                    <input
                      type="url"
                      value={prodGithubUrl}
                      onChange={(e) => setProdGithubUrl(e.target.value)}
                      placeholder="https://github.com/ayush0121n/..."
                      className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 text-xs font-mono uppercase border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-mono uppercase bg-flame text-ink font-semibold"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT PROJECT */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProjectModal(false)}
            className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-xl w-full bg-background border border-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <h3 className="font-display text-xl">
                  {editingProjectIdx !== null ? "Edit Project" : "Add New Project"}
                </h3>
                <button onClick={() => setShowProjectModal(false)}>
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    placeholder="e.g. MalariaScope"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={projSubtitle}
                    onChange={(e) => setProjSubtitle(e.target.value)}
                    placeholder="e.g. AI-Powered Medical Diagnosis"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Category</label>
                    <input
                      type="text"
                      value={projCategory}
                      onChange={(e) => setProjCategory(e.target.value)}
                      placeholder="e.g. AI / ML, Full-Stack"
                      className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Year</label>
                    <input
                      type="text"
                      value={projYear}
                      onChange={(e) => setProjYear(e.target.value)}
                      className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={projTech}
                    onChange={(e) => setProjTech(e.target.value)}
                    placeholder="Python, TensorFlow, React, FastAPI"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">GitHub / Live URL</label>
                  <input
                    type="url"
                    value={projGithub}
                    onChange={(e) => setProjGithub(e.target.value)}
                    placeholder="https://github.com/ayush0121n/..."
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Detailed Writeup</label>
                  <textarea
                    rows={4}
                    value={projDetails}
                    onChange={(e) => setProjDetails(e.target.value)}
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Bullet Highlights (one per line)</label>
                  <textarea
                    rows={3}
                    value={projHighlights}
                    onChange={(e) => setProjHighlights(e.target.value)}
                    placeholder="Achieved 93% accuracy&#10;Deployed sub-3-second API"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="proj-featured"
                    checked={projFeatured}
                    onChange={(e) => setProjFeatured(e.target.checked)}
                    className="size-4 accent-flame"
                  />
                  <label htmlFor="proj-featured" className="text-xs font-mono uppercase">
                    Featured on Homepage
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-4 py-2 text-xs font-mono uppercase border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-mono uppercase bg-flame text-ink font-semibold"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT EXPERIENCE */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showExpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExpModal(false)}
            className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full bg-background border border-border p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <h3 className="font-display text-xl">
                  {editingExpIdx !== null ? "Edit Experience" : "Add Experience"}
                </h3>
                <button onClick={() => setShowExpModal(false)}>
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveExp} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={expRole}
                    onChange={(e) => setExpRole(e.target.value)}
                    placeholder="e.g. Trainee Full-Stack Developer"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    value={expOrg}
                    onChange={(e) => setExpOrg(e.target.value)}
                    placeholder="e.g. EBIZTECH"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Date Duration</label>
                    <input
                      type="text"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      placeholder="e.g. Sep 2026 – Present"
                      className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={expLoc}
                      onChange={(e) => setExpLoc(e.target.value)}
                      placeholder="e.g. Pune, MH / Remote"
                      className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Description & Impact</label>
                  <textarea
                    rows={3}
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Status</label>
                  <input
                    type="text"
                    value={expStatus}
                    onChange={(e) => setExpStatus(e.target.value)}
                    placeholder="e.g. Present / Completed"
                    className="w-full bg-card border border-border p-2 text-xs font-mono focus:border-flame focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowExpModal(false)}
                    className="px-4 py-2 text-xs font-mono uppercase border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-mono uppercase bg-flame text-ink font-semibold"
                  >
                    Save Experience
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
