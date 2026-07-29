import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({
  to,
  suffix = "",
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => v.toFixed(decimals) + suffix);
  useEffect(() => {
    if (inView) animate(mv, to, { duration: 2, ease: [0.22, 1, 0.36, 1] });
  }, [inView, to, mv]);
  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const stats = [
  { v: 93, s: "%", d: 0, label: "Validation accuracy on MalariaScope CNN" },
  {
    v: 10,
    s: "+",
    d: 0,
    label: "Industry certifications (Oracle, IBM, Deloitte, nasscom)",
  },
  { v: 7, s: "+", d: 0, label: "AI Lab tools planned across the platform" },
  { v: 2, s: "+", d: 0, label: "Verified software projects in production" },
];

export function Stats() {
  return (
    <section className="px-6 md:px-10 py-24 md:py-40 border-t border-border">
      <div className="flex items-end justify-between mb-16">
        <h2 className="font-display text-[clamp(3rem,8vw,9rem)]">
          Numbers <br />
          <span className="text-flame italic">that matter.</span>
        </h2>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          (Why me)
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.7 }}
            className="bg-background p-6 md:p-10"
          >
            <div className="font-display text-6xl md:text-8xl text-flame">
              <Counter to={s.v} suffix={s.s} decimals={s.d} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-[20ch]">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
