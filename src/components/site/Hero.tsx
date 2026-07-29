import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { RotationButton } from "./RotationButton";
import { FloatingOrb } from "./FloatingOrb";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const reveal = {
    hidden: { y: "110%" },
    show: (i: number) => ({
      y: "0%",
      transition: {
        duration: 1.1,
        delay: 0.1 + i * 0.08,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col justify-end overflow-hidden grain pt-28 pb-10 px-6 md:px-10"
    >
      {/* Floating 3D orb */}
      <FloatingOrb className="absolute top-24 right-6 md:right-16 size-56 md:size-80 z-0" />

      {/* Animated SVG grid */}
      <svg
        aria-hidden
        className="absolute inset-0 size-full opacity-[0.06] pointer-events-none"
      >
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <motion.div style={{ y, opacity }} className="relative z-10">
        <div className="font-display text-[clamp(3.5rem,16vw,18rem)] leading-[0.82] space-y-6">
          {["BUILDING", "INTELLIGENT", "DIGITAL", "EXPERIENCES."].map(
            (line, i) => (
              <div key={i} className="overflow-hidden">
                <motion.div
                  custom={i}
                  initial="hidden"
                  animate="show"
                  variants={reveal}
                  className={`${i === 3 ? "text-flame italic" : ""} mb-4`}
                >
                  {line}
                </motion.div>
              </div>
            ),
          )}
        </div>

        <div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="max-w-md text-sm md:text-base text-muted-foreground"
          >
            AyushDevX — an AI & technology brand building intelligent
            applications, AI-powered tools, and digital products with
            open-source AI and modern full-stack engineering.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="self-start md:self-end"
          >
            <RotationButton />
          </motion.div>
        </div>
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 bottom-24 font-display text-[18vw] text-flame/10 select-none"
      >
        AYUSHDEVX
      </div>
    </section>
  );
}
