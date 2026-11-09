import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — Admin Access & Login" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const enteredEmail = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    // Verify authorized admin credentials strictly
    const isAuthorizedEmail =
      enteredEmail === "ayushgnarkhede0121@gmail.com" ||
      enteredEmail === "admin@ayushdevx.com";

    const isAuthorizedPassword = enteredPassword === "Ayush@0121";

    if (isAuthorizedEmail && isAuthorizedPassword) {
      localStorage.setItem("ayushdevx_admin_auth", "true");
      localStorage.setItem("ayushdevx_admin_email", enteredEmail);
      setIsLoading(false);
      navigate({ to: "/admin" });
      return;
    }

    setError("Invalid admin email or password. Please check your credentials.");
    setIsLoading(false);
  };

  return (
    <main className="bg-background text-foreground min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex p-3 bg-flame/10 text-flame mb-3">
            <Lock className="size-6" />
          </div>
          <h1 className="font-display text-3xl tracking-tight">AyushDevX</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground font-mono">
            Admin Console & Master CMS
          </p>
        </div>

        {/* Login Card */}
        <div className="border border-border bg-card p-8 md:p-10 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/60">
            <h2 className="font-display text-xl">Sign In</h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-flame/10 text-flame border border-flame/20">
              Restricted
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="text-xs uppercase tracking-[0.15em] text-muted-foreground block font-mono"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ayushgnarkhede0121@gmail.com"
                required
                autoComplete="email"
                className="w-full bg-background border border-border px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-flame transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="text-xs uppercase tracking-[0.15em] text-muted-foreground block font-mono"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
                className="w-full bg-background border border-border px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-flame transition-colors"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 border border-destructive/40 bg-destructive/10 text-xs text-destructive font-mono"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              id="admin-login-button"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full py-3 bg-flame text-ink text-xs uppercase tracking-[0.2em] font-semibold hover:bg-flame/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isLoading ? "Verifying..." : "Sign In to Admin"}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[0.65rem] text-muted-foreground/60 uppercase tracking-[0.2em] font-mono">
          AyushDevX · Restricted Admin Access
        </p>
      </motion.div>
    </main>
  );
}
