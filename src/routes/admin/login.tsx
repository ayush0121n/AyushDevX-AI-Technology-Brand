import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [
      { title: "AyushDevX — Admin Login" },
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

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!data.user) {
        setError("Authentication failed. Please try again.");
        return;
      }

      // Verify the user has admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError("Profile not found. Please contact the administrator.");
        return;
      }

      const profileData = profile as { role: string };
      if (profileData.role !== "admin") {
        await supabase.auth.signOut();
        setError("You do not have admin privileges.");
        return;
      }

      await navigate({ to: "/admin" });
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="mb-12 text-center">
          <span className="font-display text-3xl tracking-tight">AyushDevX</span>
          <sup className="text-flame text-xs ml-0.5">®</sup>
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Admin Console
          </p>
        </div>

        {/* Login Card */}
        <div className="border border-border bg-card p-8 md:p-10">
          <h1 className="font-display text-2xl mb-6">Sign In</h1>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="admin-email"
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
              >
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ayushdevx.com"
                required
                autoComplete="email"
                className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="admin-password"
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground block"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-flame transition-colors"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 border border-destructive/40 bg-destructive/5 text-xs text-destructive"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              id="admin-login-button"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full py-3.5 bg-flame text-ink text-xs uppercase tracking-[0.2em] font-medium hover:bg-flame/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              )}
              {isLoading ? "Authenticating..." : "Sign In →"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[0.65rem] text-muted-foreground/60 uppercase tracking-[0.2em]">
          AyushDevX · Restricted Access · v1.0
        </p>
      </motion.div>
    </main>
  );
}
