import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { About } from "@/components/site/About";
import { Work } from "@/components/site/Work";
import { Stats } from "@/components/site/Stats";
import { Services } from "@/components/site/Services";
import { Process } from "@/components/site/Process";
import { Testimonials } from "@/components/site/Testimonials";
import { Footer } from "@/components/site/Footer";
import { SmoothScroll } from "@/components/site/SmoothScroll";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AyushDevX — Building Intelligent Digital Experiences" },
      {
        name: "description",
        content:
          "AyushDevX is an AI & technology brand building intelligent applications, AI-powered tools, and digital products with open-source AI and full-stack engineering.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="bg-background text-foreground">
      <SmoothScroll />
      <Nav />
      <Hero />
      <section className="py-8 border-y border-border overflow-hidden">
        <Marquee
          items={[
            "AI / ML",
            "MERN Stack",
            "TensorFlow",
            "React",
            "Node.js",
            "Oracle Cloud",
          ]}
        />
      </section>
      <Work />
      <About />
      <Stats />
      <Services />
      <Process />
      <Testimonials />
      <Footer />
    </main>
  );
}
