import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import studio from "@/assets/studio.jpg";
import neural from "@/assets/neural.jpg";
import code3d from "@/assets/code3d.jpg";

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["-10%", "20%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["15%", "-25%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["-20%", "30%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);

  const words =
    "We build intelligent applications, AI-powered tools, and digital products — engineered for accuracy, scale, and real-world impact.".split(
      " ",
    );

  return (
    <section
      id="about"
      ref={ref}
      className="relative px-6 md:px-10 py-24 md:py-40 border-t border-border overflow-hidden"
    >
      <div className="flex items-end justify-between mb-16">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          (About)
        </span>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          PUNE · INDIA
        </span>
      </div>
      <p className="font-display text-[clamp(2rem,5.5vw,5.5rem)] leading-[1.05] max-w-6xl">
        {words.map((w, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0.15 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.5, delay: i * 0.04 }}
            className="inline-block mr-[0.25em]"
          >
            {w === "accuracy," || w === "impact." ? (
              <span className="text-flame italic">{w}</span>
            ) : (
              w
            )}
          </motion.span>
        ))}
      </p>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-12 gap-6">
        <motion.div
          style={{ y: y1 }}
          className="md:col-span-7 relative h-[50vh] overflow-hidden"
        >
          <img
            src={studio}
            alt="Workspace"
            width={1920}
            height={1200}
            loading="lazy"
            className="absolute inset-0 size-full object-cover scale-110"
          />
        </motion.div>
        <motion.div
          style={{ y: y2, rotate }}
          className="md:col-span-5 relative h-[50vh] overflow-hidden"
        >
          <img
            src={neural}
            alt="Neural network"
            width={1280}
            height={1280}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        </motion.div>
        <motion.div
          style={{ y: y3 }}
          className="md:col-span-5 md:col-start-4 relative h-[40vh] overflow-hidden"
        >
          <img
            src={code3d}
            alt="3D code"
            width={1280}
            height={1280}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
