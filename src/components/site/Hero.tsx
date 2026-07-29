import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Magnetic } from "./Magnetic";
import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-end pb-16 pt-36 px-6 md:px-10 border-b border-border overflow-hidden">
      {/* Background ambient gradient lighting */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-flame/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-flame/5 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto w-full">
        {/* Top Eyebrow Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="h-2 w-2 rounded-full bg-flame inline-block animate-ping" />
          <span className="text-xs uppercase tracking-[0.25em] text-flame font-medium">
            (01 / {profile.hero.eyebrow.toUpperCase()})
          </span>
        </motion.div>

        {/* Primary Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[clamp(2.8rem,7.5vw,7.8rem)] leading-[0.9] tracking-tight text-foreground font-light uppercase"
        >
          Building Intelligent <br />
          <span className="italic font-normal text-flame">
            Digital Experiences
          </span>{" "}
          <br />
          with AI & Technology.
        </motion.h1>

        {/* Professional Label & Description Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-[0.2em] text-flame font-semibold block mb-2">
              {profile.role}
            </span>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Designing intelligent applications, deep learning systems, and
              scalable full-stack digital products.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Magnetic strength={0.25}>
              <Link
                to={profile.hero.primaryCta.href}
                className="text-xs uppercase tracking-[0.2em] bg-flame text-ink px-8 py-4 font-medium hover:bg-flame/90 transition-colors inline-block"
              >
                {profile.hero.primaryCta.label} →
              </Link>
            </Magnetic>

            <Magnetic strength={0.25}>
              <Link
                to={profile.hero.secondaryCta.href}
                className="text-xs uppercase tracking-[0.2em] border border-border px-8 py-4 text-foreground hover:border-flame hover:text-flame transition-colors inline-block"
              >
                {profile.hero.secondaryCta.label} ↗
              </Link>
            </Magnetic>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
