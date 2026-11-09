import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { useCertificates } from "@/hooks/useCertificates";
import { CertificateGalleryItem } from "@/data/certificatesData";
import {
  Award,
  CheckCircle2,
  FileText,
  Download,
  ExternalLink,
  PlusCircle,
  Trash2,
  X,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/certificates")({
  component: CertificatesPage,
  head: () => ({
    meta: [
      { title: "Certificates & Licences — Ayush Narkhede | AyushDevX" },
      {
        name: "description",
        content:
          "Explore all 50+ industry certifications, digital badges, and verified PDF credentials of Ayush Narkhede (Oracle OCI, ServiceNow, Microsoft, IBM, Google, nasscom).",
      },
    ],
  }),
});

const categories = [
  "All",
  "AI & GenAI",
  "Cloud & OCI",
  "Full-Stack & Java",
  "Assessments",
] as const;

type Category = (typeof categories)[number];

function CertificatesPage() {
  const { certificates, addCertificate, deleteCertificate } = useCertificates();

  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCert, setActiveCert] = useState<CertificateGalleryItem | null>(null);

  // Authenticated Admin check from localStorage (set ONLY after logging into /admin)
  const [isLoggedInAdmin, setIsLoggedInAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("ayushdevx_admin_auth") === "true";
      setIsLoggedInAdmin(isAuth);
    }
  }, []);

  // New certificate form state
  const [newTitle, setNewTitle] = useState("");
  const [newIssuer, setNewIssuer] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("AI & GenAI");
  const [newDate, setNewDate] = useState("2026");
  const [newBadge, setNewBadge] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newPdfUrl, setNewPdfUrl] = useState("");

  const filteredCerts = certificates.filter((c) => {
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.badge && c.badge.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newIssuer.trim()) return;

    const newCert: CertificateGalleryItem = {
      id: "cert-" + Date.now(),
      title: newTitle.trim(),
      issuer: newIssuer.trim(),
      category: newCategory === "All" ? "AI & GenAI" : newCategory,
      date: newDate.trim() || "2026",
      image: newImageUrl.trim() || "/certificates/Founderz_Microsoft_Agent_Architect.png",
      pdf: newPdfUrl.trim() || undefined,
      badge: newBadge.trim() || undefined,
    };

    addCertificate(newCert);

    // Reset form
    setNewTitle("");
    setNewIssuer("");
    setNewBadge("");
    setNewImageUrl("");
    setNewPdfUrl("");
    setShowAddModal(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <SmoothScroll />
      <Nav />

      {/* Hero Section */}
      <section className="pt-36 pb-14 px-6 md:px-10 border-b border-border bg-muted/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="size-4 text-flame" />
              <span className="text-xs uppercase tracking-[0.2em] text-flame font-mono">
                Verified Credentials & Licences ({certificates.length}+)
              </span>
            </div>
            <h1 className="font-display text-[clamp(2.5rem,7vw,6.5rem)] leading-none tracking-tight">
              Certificates & <span className="text-flame italic">Licences.</span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl font-sans">
              All official licenses, industry badges, and assessments issued by Microsoft, Oracle Cloud (OCI), ServiceNow, nasscom FutureSkills Gold, IBM SkillsBuild, Google, HackerRank, and Infosys Springboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/resume/Ayush_Narkhede_Resume_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider bg-flame text-ink font-semibold rounded-none hover:bg-flame/90 transition-all shadow-md"
            >
              <FileText className="size-4" />
              <span>Download Master Resume</span>
              <Download className="size-3.5 ml-1" />
            </a>


          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-border/60">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest font-mono transition-all border ${
                    selectedCategory === cat
                      ? "bg-foreground text-background border-foreground font-bold"
                      : "bg-muted/30 text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search certificate or skill..."
                className="w-full bg-card border border-border pl-9 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-flame"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Certificates Grid */}
          {filteredCerts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border p-12">
              <Award className="size-10 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="font-display text-2xl text-muted-foreground">No certificates match your query</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 text-xs font-mono uppercase bg-flame text-ink font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCerts.map((cert) => (
                <motion.div
                  key={cert.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="group relative border border-border bg-card/70 hover:bg-card hover:border-flame/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
                >


                  {/* Image Preview Box */}
                  <div
                    onClick={() => setActiveCert(cert)}
                    className="cursor-pointer relative aspect-[16/11] bg-muted/40 overflow-hidden border-b border-border/60 flex items-center justify-center p-3"
                  >
                    <img
                      src={cert.image}
                      alt={cert.title}
                      loading="lazy"
                      className="size-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-sm"
                    />
                    {cert.badge && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-mono tracking-wider bg-flame text-ink font-semibold uppercase shadow-sm">
                        {cert.badge}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 text-xs bg-background/90 text-foreground font-mono tracking-wider flex items-center gap-1.5 shadow-lg">
                        <span>Inspect Full</span>
                        <ExternalLink className="size-3" />
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1.5">
                        <span className="truncate pr-2 font-medium">{cert.issuer}</span>
                        <span className="shrink-0">{cert.date}</span>
                      </div>
                      <h3
                        onClick={() => setActiveCert(cert)}
                        className="font-display text-base leading-snug group-hover:text-flame transition-colors line-clamp-2 cursor-pointer"
                      >
                        {cert.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[10px] uppercase font-mono">
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                        <CheckCircle2 className="size-3" />
                        Verified
                      </span>

                      {/* PDF direct view link if available */}
                      {cert.pdf ? (
                        <a
                          href={cert.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-flame hover:underline flex items-center gap-1 font-semibold"
                        >
                          <FileText className="size-3" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground/80">{cert.category}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveCert(null)}
            className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[92vh] bg-background border border-border shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="p-4 md:px-6 border-b border-border flex items-center justify-between bg-muted/20">
                <div>
                  <span className="text-xs font-mono text-flame uppercase tracking-wider">
                    {activeCert.issuer} &bull; {activeCert.date}
                  </span>
                  <h3 className="font-display text-lg md:text-xl leading-tight">
                    {activeCert.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {activeCert.pdf && (
                    <a
                      href={activeCert.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-flame/10 text-flame border border-flame/30 text-xs font-mono uppercase tracking-wider hover:bg-flame hover:text-ink transition-colors"
                    >
                      <FileText className="size-3.5" />
                      <span>Open PDF</span>
                    </a>
                  )}
                  <a
                    href={activeCert.image}
                    download
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Download certificate image"
                  >
                    <Download className="size-4" />
                  </a>
                  <button
                    onClick={() => setActiveCert(null)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Modal Image Body */}
              <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-muted/10">
                <img
                  src={activeCert.image}
                  alt={activeCert.title}
                  className="max-h-[68vh] w-auto max-w-full object-contain shadow-lg border border-border/50"
                />
              </div>

              {/* Modal Bottom Bar */}
              <div className="p-4 md:px-6 border-t border-border flex flex-wrap items-center justify-between gap-3 bg-muted/20 text-xs">
                <div className="flex items-center gap-2 text-emerald-500 font-mono">
                  <CheckCircle2 className="size-4" />
                  <span>Official Verified Credential</span>
                  {activeCert.badge && (
                    <span className="ml-2 px-2 py-0.5 bg-flame/10 text-flame border border-flame/20 text-[10px]">
                      {activeCert.badge}
                    </span>
                  )}
                </div>
                <a
                  href="/resume/Ayush_Narkhede_Resume_2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-flame hover:underline flex items-center gap-1"
                >
                  <span>Open Full Resume (PDF)</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
    </main>
  );
}
