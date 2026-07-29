import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Magnetic } from "./Magnetic";

const links = [
  { href: "/", label: "Home" },
  { href: "/ai-lab", label: "AI Lab" },
  { href: "/products", label: "Products" },
  { href: "/projects", label: "Projects" },
  { href: "/knowledge-hub", label: "Knowledge Hub" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-50 px-6 md:px-10 py-5 flex items-center justify-between mix-blend-difference text-foreground"
      >
        {/* Brand logo */}
        <Magnetic>
          <a
            href="/"
            aria-label="AyushDevX — Home"
            className="font-display text-xl tracking-tight inline-flex items-baseline gap-0.5"
          >
            AYUSHDEV<span className="text-flame">X</span>
            <sup className="text-[0.5rem] align-super opacity-60">®</sup>
          </a>
        </Magnetic>

        {/* Desktop links — show only first 6 to avoid overflow */}
        <ul className="hidden lg:flex items-center gap-6 text-[0.65rem] uppercase tracking-[0.2em]">
          {links.slice(1, 7).map((l) => (
            <li key={l.href}>
              <Magnetic strength={0.4}>
                <a
                  href={l.href}
                  className="relative inline-block hover:text-flame transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-flame hover:after:w-full after:transition-all after:duration-500"
                >
                  {l.label}
                </a>
              </Magnetic>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {/* CTA */}
          <Magnetic strength={0.5}>
            <a
              href="/contact"
              className="hidden md:inline-block text-[0.65rem] uppercase tracking-[0.2em] border border-current px-4 py-2 hover:bg-flame hover:text-ink hover:border-flame transition-colors"
            >
              Get in Touch
            </a>
          </Magnetic>

          {/* Mobile hamburger */}
          <button
            id="nav-menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden flex flex-col justify-center gap-[5px] w-7 h-7"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="block h-px w-full bg-current origin-center"
            />
            <motion.span
              animate={
                open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }
              }
              className="block h-px w-full bg-current"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="block h-px w-full bg-current origin-center"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            key="mobile-nav"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 lg:hidden"
          >
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="font-display text-4xl hover:text-flame transition-colors"
              >
                {l.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
