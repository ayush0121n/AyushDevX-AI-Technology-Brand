import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { certificateGallery, CertificateGalleryItem } from "@/data/profile";
import { ExternalLink, X, Award, CheckCircle2, FileText, Download } from "lucide-react";

const categories = [
  "All",
  "AI & GenAI",
  "Cloud & OCI",
  "Full-Stack & Java",
  "Assessments",
] as const;

type Category = (typeof categories)[number];

export function Certificates() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [activeCert, setActiveCert] = useState<CertificateGalleryItem | null>(null);

  const filteredCerts =
    selectedCategory === "All"
      ? certificateGallery
      : certificateGallery.filter((c) => c.category === selectedCategory);

  return (
    <section id="certificates" className="px-6 md:px-10 py-24 md:py-36 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="size-4 text-flame" />
              <span className="text-xs uppercase tracking-[0.2em] text-flame font-mono">
                Verified Credentials ({certificateGallery.length}+)
              </span>
            </div>
            <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-none">
              Licences & <span className="text-flame italic">Certifications.</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/resume/Ayush_Narkhede_Resume_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider bg-flame text-ink font-semibold rounded-none hover:bg-flame/90 transition-all"
            >
              <FileText className="size-3.5" />
              <span>View Master Resume (A4)</span>
              <Download className="size-3.5 ml-1" />
            </a>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-10 pb-2 border-b border-border/60">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-mono transition-all border ${
                selectedCategory === cat
                  ? "bg-foreground text-background border-foreground font-bold"
                  : "bg-muted/40 text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Certificate Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCerts.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
              onClick={() => setActiveCert(cert)}
              className="group cursor-pointer border border-border bg-card/80 hover:bg-card hover:border-flame/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
            >
              {/* Image Preview Box */}
              <div className="relative aspect-[16/11] bg-muted/30 overflow-hidden border-b border-border/60 flex items-center justify-center p-3">
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
                    <span>Inspect</span>
                    <ExternalLink className="size-3" />
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1.5">
                    <span>{cert.issuer}</span>
                    <span>{cert.date}</span>
                  </div>
                  <h3 className="font-display text-base leading-snug group-hover:text-flame transition-colors line-clamp-2">
                    {cert.title}
                  </h3>
                </div>

                <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[10px] uppercase font-mono text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                    <CheckCircle2 className="size-3" />
                    Verified
                  </span>
                  <span className="text-muted-foreground/80">{cert.category}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveCert(null)}
            className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] bg-background border border-border shadow-2xl flex flex-col overflow-hidden"
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
                  className="max-h-[65vh] w-auto max-w-full object-contain shadow-lg border border-border/50"
                />
              </div>

              {/* Modal Bottom Bar */}
              <div className="p-4 md:px-6 border-t border-border flex flex-wrap items-center justify-between gap-3 bg-muted/20 text-xs">
                <div className="flex items-center gap-2 text-emerald-500 font-mono">
                  <CheckCircle2 className="size-4" />
                  <span>Verified Credential Record</span>
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
    </section>
  );
}

