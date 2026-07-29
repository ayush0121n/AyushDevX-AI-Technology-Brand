import { motion } from "framer-motion";

const items = [
  {
    n: "01",
    title: "Brand & Platform Architecture",
    desc: "Engineered high-performance full-stack foundation with TanStack Start, Supabase PostgreSQL, and custom OKLCH design tokens.",
  },
  {
    n: "02",
    title: "AI Lab & Applied Systems",
    desc: "Deploying open-source RAG pipelines, local browser-based inference, and interactive developer utilities.",
  },
  {
    n: "03",
    title: "Knowledge Hub & Open Source",
    desc: "Curating verified technical guides, engineering research, and production software patterns.",
  },
  {
    n: "04",
    title: "Product Studio Evolution",
    desc: "Scaling independent AI tools, developer utilities, and modern web applications for real-world impact.",
  },
];

export function Process() {
  return (
    <section className="px-6 md:px-10 py-24 md:py-40 border-t border-border">
      <div className="flex items-end justify-between mb-16">
        <h2 className="font-display text-[clamp(3rem,8vw,9rem)]">
          Platform <br />
          <span className="text-flame italic">roadmap.</span>
        </h2>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          (Evolution)
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border">
        {items.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.7 }}
            className="bg-background p-8 min-h-[260px] flex flex-col justify-between"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-flame">
              {s.n}
            </span>
            <div>
              <h3 className="font-display text-3xl md:text-4xl">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
