"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { FiLock, FiMail, FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      router.push("/admin");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="gradient-orb w-96 h-96 bg-primary top-1/4 -left-48 pointer-events-none" />
      <div className="gradient-orb w-80 h-80 bg-accent bottom-1/4 -right-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card p-8 sm:p-10 shadow-2xl">
          {/* Header with clean, non-overlapping icon and title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
              <FiLock className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted mt-1.5">
              Sign in to manage your portfolio
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium mb-2 text-foreground/90">
                Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-muted flex items-center justify-center z-10">
                  <FiMail size={18} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  style={{ paddingLeft: "2.85rem", paddingRight: "1rem" }}
                  className="admin-input !pl-12 !pr-4 py-2.5 rounded-xl transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium mb-2 text-foreground/90">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-muted flex items-center justify-center z-10">
                  <FiLock size={18} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingLeft: "2.85rem", paddingRight: "2.85rem" }}
                  className="admin-input !pl-12 !pr-12 py-2.5 rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 text-muted hover:text-foreground transition-colors p-1 rounded-md z-10"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn w-full py-3 mt-2 flex items-center justify-center gap-2 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-4 border-t border-border">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors font-medium"
            >
              ← Back to Portfolio
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
