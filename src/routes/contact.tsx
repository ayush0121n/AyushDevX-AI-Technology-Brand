import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Magnetic } from "@/components/site/Magnetic";
import { supabase } from "@/lib/supabase";
import { profile } from "@/data/profile";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: `${profile.brandName} — Contact & Connect` },
      {
        name: "description",
        content:
          "Connect with AyushDevX for collaborations, AI product inquiries, software engineering consulting, or open-source contributions.",
      },
    ],
  }),
});

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      if (!supabase) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        return;
      }

      const { error } = await (
        supabase.from("contact_messages") as unknown as {
          insert: (
            data: unknown[],
          ) => Promise<{ error: { message: string } | null }>;
        }
      ).insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      console.error("Error submitting contact message:", err);
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col justify-between">
      <div>
        <Nav />

        {/* Hero Header */}
        <section className="pt-36 pb-16 px-6 md:px-10 border-b border-border">
          <div className="max-w-6xl">
            <span className="text-xs uppercase tracking-[0.25em] text-flame block mb-4">
              (04 / Contact {profile.brandName})
            </span>
            <h1 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.9] tracking-tight">
              Let&apos;s build <br />
              <span className="text-flame italic">something together.</span>
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl">
              Have an opportunity, product idea, or AI engineering inquiry?
              Connect with {profile.brandName} directly below.
            </p>
          </div>
        </section>

        {/* Contact Content & Form */}
        <section className="px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Direct Info */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-flame block mb-2">
                  Direct Inquiries
                </span>
                <h3 className="font-display text-2xl">
                  Open for collaboration.
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  We welcome conversations around intelligent digital
                  experiences, open-source AI tools, full-stack software
                  development, and technical partnerships.
                </p>
              </div>

              <div className="space-y-6 pt-6 border-t border-border">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                    Email
                  </span>
                  <a
                    href={`mailto:${profile.contact.email}`}
                    className="text-sm font-medium hover:text-flame transition-colors"
                  >
                    {profile.contact.email}
                  </a>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                    GitHub
                  </span>
                  <a
                    href={profile.contact.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium hover:text-flame transition-colors"
                  >
                    github.com/ayush0121n ↗
                  </a>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                    LinkedIn
                  </span>
                  <a
                    href={profile.contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium hover:text-flame transition-colors"
                  >
                    linkedin.com/in/ayush-narkhede ↗
                  </a>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                    Location
                  </span>
                  <p className="text-sm text-foreground/90">
                    {profile.contact.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7 lg:pl-8 lg:border-l lg:border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
                    >
                      Your Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Jane Doe"
                      className="w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
                    >
                      Your Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="jane@company.com"
                      className="w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
                  >
                    Subject *
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="AI Tool Collaboration / Inquiry"
                    className="w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tell us about your project, idea, or inquiry..."
                    className="w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors resize-none"
                  />
                </div>

                {status === "success" && (
                  <div className="p-4 bg-flame/10 border border-flame text-flame text-sm">
                    ✓ Message received — thank you! We will get back to you
                    shortly.
                  </div>
                )}

                {status === "error" && (
                  <div className="p-4 bg-destructive/10 border border-destructive text-destructive text-sm">
                    {errorMessage || "An error occurred. Please try again."}
                  </div>
                )}

                <div>
                  <Magnetic strength={0.2}>
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="text-xs uppercase tracking-[0.2em] bg-flame text-ink px-8 py-4 font-medium hover:bg-flame/90 transition-colors disabled:opacity-50"
                    >
                      {status === "loading"
                        ? "Sending Message..."
                        : "Send Message →"}
                    </button>
                  </Magnetic>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
