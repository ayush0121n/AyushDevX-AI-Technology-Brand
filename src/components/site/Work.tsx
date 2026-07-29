import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { TiltCard } from "./TiltCard";
import { Unroll } from "./Unroll";
import malariascopeCover from "@/assets/malariascope_cover.png";
import estatexaiCover from "@/assets/estatexai_cover.png";
import proconnectCover from "@/assets/proconnect_cover.png";
import { profile } from "@/data/profile";

const projects = [
  {
    n: "01",
    title: "MalariaScope",
    desc: "AI-powered malaria detection — 93% val accuracy, 0.97 ROC-AUC on 27,558 NIH blood-smear images. Classification reports generated via Flask API.",
    tag: "Python · TensorFlow · Flask",
    img: malariascopeCover,
    href: profile.projects[0].githubUrl,
  },
  {
    n: "02",
    title: "EstateXAI",
    desc: "AI-driven real estate & PG finder. MERN, role-based auth, REST APIs, MongoDB Atlas, and geospatial listing filters.",
    tag: "MERN · JWT · MongoDB",
    img: estatexaiCover,
    href: profile.projects[1].githubUrl,
  },
  {
    n: "03",
    title: "ProConnect",
    desc: "Professional networking platform with real-time Socket.IO messaging and 20+ atomic-design components.",
    tag: "React 19 · TS · Socket.IO",
    img: proconnectCover,
    href: profile.projects[2].githubUrl,
  },
];

export function Work() {
  return (
    <section
      id="work"
      className="px-6 md:px-10 py-24 md:py-40 border-t border-border"
    >
      <div className="flex items-end justify-between mb-16">
        <div>
          <h2 className="font-display text-[clamp(3rem,8vw,9rem)]">
            Selected <span className="text-flame italic">work</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore verified deep learning systems and full-stack MERN products.
          </p>
        </div>
        <Link
          to="/projects"
          className="text-xs uppercase tracking-[0.2em] text-flame hover:underline font-medium hidden sm:block"
        >
          View All Projects →
        </Link>
      </div>

      <Unroll>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((p, i) => (
            <motion.a
              key={p.n}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group block"
            >
              <TiltCard className="border border-border bg-card p-4 transition-all duration-300 hover:border-flame">
                <div className="aspect-[4/3] bg-muted mb-6 overflow-hidden border border-border relative">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-1 bg-ink/80 border border-border text-[0.65rem] uppercase tracking-wider font-mono">
                    Verified GitHub ↗
                  </div>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display text-2xl group-hover:text-flame transition-colors">
                    {p.title}
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    {p.n}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                  {p.desc}
                </p>

                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-xs font-mono text-flame">{p.tag}</span>
                  <span className="text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Source →
                  </span>
                </div>
              </TiltCard>
            </motion.a>
          ))}
        </div>
      </Unroll>

      <div className="mt-12 text-center sm:hidden">
        <Link
          to="/projects"
          className="text-xs uppercase tracking-[0.2em] bg-card border border-border px-8 py-4 inline-block font-medium hover:border-flame hover:text-flame transition-colors"
        >
          View All Projects →
        </Link>
      </div>
    </section>
  );
}
