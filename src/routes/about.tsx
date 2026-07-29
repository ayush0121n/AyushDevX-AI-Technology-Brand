import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { profile } from "@/data/profile";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      {
        title: `${profile.brandName} — About Our AI & Technology Brand`,
      },
      {
        name: "description",
        content: profile.about.summary,
      },
    ],
  }),
});

const skillCategories = [
  {
    name: "Artificial Intelligence & ML",
    items: profile.skills.aiMl,
  },
  {
    name: "Full-Stack Development",
    items: profile.skills.fullStack,
  },
  {
    name: "Programming Languages",
    items: profile.skills.languages,
  },
  {
    name: "Data & Cloud Infrastructure",
    items: profile.skills.dataCloud,
  },
  {
    name: "Core Computer Science",
    items: profile.skills.coreComputerScience,
  },
];

function AboutPage() {
  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Hero Header */}
        <section className="pt-36 pb-16 px-6 md:px-10 border-b border-border">
          <div className="max-w-6xl">
            <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-4">
              (03 / About {profile.brandName})
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight">
              AI product studio <br />
              <span className="text-flame italic">& technology brand.</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {profile.brandName} is a professional technology brand dedicated
              to building intelligent applications, AI-powered tools, software
              products, and digital experiences that scale.
            </p>
          </div>
        </section>

        {/* Professional Summary Section */}
        <section className="px-6 md:px-10 py-16 md:py-24 border-b border-border">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-3">
                Professional Identity
              </span>
              <h2 className="font-display text-3xl md:text-5xl leading-tight">
                Where artificial intelligence meets{" "}
                <span className="text-flame italic">real engineering.</span>
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-foreground/90 text-base">
                {profile.about.summary}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-foreground font-display text-lg">
                <div className="p-4 border border-border bg-card">
                  <span className="text-flame block text-xs uppercase tracking-widest mb-1">
                    01
                  </span>
                  Production Quality
                </div>
                <div className="p-4 border border-border bg-card">
                  <span className="text-flame block text-xs uppercase tracking-widest mb-1">
                    02
                  </span>
                  Simple Architecture
                </div>
                <div className="p-4 border border-border bg-card">
                  <span className="text-flame block text-xs uppercase tracking-widest mb-1">
                    03
                  </span>
                  Verified Engineering
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Skills Grid */}
        <section className="px-6 md:px-10 py-16 md:py-24 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-2">
                  Technical Arsenal
                </span>
                <h2 className="font-display text-4xl md:text-6xl">
                  Skills & technologies.
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {skillCategories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-8 border border-border bg-card flex flex-col justify-between space-y-6"
                >
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-3">
                      0{i + 1}
                    </span>
                    <h3 className="font-display text-2xl mb-4">{cat.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item) => (
                        <span
                          key={item}
                          className="text-xs px-3 py-1.5 bg-background border border-border text-foreground/90 font-mono"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience & Fellowships */}
        <section className="px-6 md:px-10 py-16 md:py-24 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-3">
              Professional Engagement
            </span>
            <h2 className="font-display text-4xl md:text-6xl mb-12">
              Selected <span className="text-flame italic">experience.</span>
            </h2>

            <div className="space-y-6">
              {profile.experience.map((exp) => (
                <div
                  key={exp.organization}
                  className="p-8 border border-border bg-card flex flex-col md:flex-row md:items-start justify-between gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xs uppercase tracking-widest px-2.5 py-0.5 bg-flame/15 text-flame border border-flame/30 font-semibold">
                        {exp.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {exp.date} · {exp.location}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl">
                      {exp.role} —{" "}
                      <span className="text-flame">{exp.organization}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="px-6 md:px-10 py-16 md:py-24 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-3">
              Industry Credentials
            </span>
            <h2 className="font-display text-4xl md:text-6xl mb-12">
              Verified{" "}
              <span className="text-flame italic">certifications.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.certifications.map((cert, i) => (
                <div
                  key={cert}
                  className="p-5 border border-border bg-card flex items-center gap-4 hover:border-flame/50 transition-colors"
                >
                  <span className="text-xs font-mono text-flame shrink-0">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-foreground/90">
                    {cert}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary Section: Leadership & Education */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Leadership Column */}
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                  Community & Governance
                </span>
                <h3 className="font-display text-3xl">Leadership & Impact</h3>
              </div>
              <div className="space-y-6">
                {profile.leadership.map((lead) => (
                  <div
                    key={lead.role}
                    className="p-6 border border-border bg-card space-y-3"
                  >
                    <span className="text-xs text-muted-foreground block">
                      {lead.date}
                    </span>
                    <h4 className="font-display text-xl">
                      {lead.role} —{" "}
                      <span className="text-flame">{lead.organization}</span>
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {lead.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {lead.highlights.map((h) => (
                        <span
                          key={h}
                          className="text-[0.7rem] px-2.5 py-1 bg-background border border-border text-foreground/80"
                        >
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education Column */}
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                  Academic Profile (Secondary)
                </span>
                <h3 className="font-display text-3xl">Education Records</h3>
              </div>
              <div className="space-y-6">
                {profile.education.map((edu) => (
                  <div
                    key={edu.degree}
                    className="p-6 border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-flame font-medium">
                        {edu.date}
                      </span>
                      <span className="text-xs font-mono bg-muted px-2.5 py-1 border border-border">
                        {edu.result}
                      </span>
                    </div>
                    <h4 className="font-display text-xl">{edu.degree}</h4>
                    {edu.specialization && (
                      <p className="text-sm text-foreground/90 font-medium">
                        Specialization: {edu.specialization}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {edu.institution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
