"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { useAuth } from "@/lib/auth-context";
import { LogIn, ArrowRight, Loader2, Eye, EyeOff, Package, Zap, BarChart3, Shield } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";

/* ─── BRAND COLORS ─── */
const INDIGO = "oklch(0.68 0.24 262)";
const CYAN   = "oklch(0.78 0.18 205)";

const features = [
  { icon: BarChart3, label: "Real-time Analytics", desc: "Track your KPIs at a glance" },
  { icon: Package,   label: "Inventory Control",   desc: "Full stock lifecycle management" },
  { icon: Zap,       label: "Lightning Fast",       desc: "Sub-second response times" },
  { icon: Shield,    label: "Enterprise Security",  desc: "Bank-grade data protection" },
];

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const fadeUp: Variants = {
  hidden:   { opacity: 0, y: 22 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function LoginForm() {
  const { login, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") || "/dashboard";

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(next);
    }
  }, [user, router, next]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const handleLogin = async (data: LoginValues) => {
    setIsLoading(true);
    try {
      await login(data);
      router.replace(next);
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login({ email: "demoUser@example.com", password: "demo123" });
      router.replace(next);
    } catch (error) {
      console.error("Demo login failed:", error);
      setIsLoading(false);
    }
  };

  /* focused border style */
  const focusBorder = (field: string) =>
    focusedField === field
      ? { borderColor: INDIGO, boxShadow: `0 0 0 3px ${INDIGO}20` }
      : {};

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">

      {/* ══════════════════════════════
          LEFT — HERO PANEL
      ══════════════════════════════ */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-between p-14 overflow-hidden">

        {/* Main gradient background — indigo + cyan only */}
        <div
          className="absolute inset-0"
          style={{
            background:
              `radial-gradient(ellipse 75% 65% at 20% 30%, ${INDIGO}E0 0%, transparent 65%), ` +
              `radial-gradient(ellipse 60% 80% at 85% 75%, ${CYAN}CC 0%, transparent 65%), ` +
              `radial-gradient(ellipse 50% 40% at 55% 5%,  ${INDIGO}55 0%, transparent 65%), ` +
              "oklch(0.09 0.025 252)",
          }}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(oklch(1 0 0) 1.5px, transparent 1.5px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Floating blobs */}
        <motion.div
          className="absolute w-80 h-80 rounded-full pointer-events-none"
          style={{
            top: "12%", left: "55%",
            background: `radial-gradient(circle, ${CYAN}50 0%, transparent 70%)`,
            filter: "blur(50px)",
          }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            bottom: "5%", left: "-8%",
            background: `radial-gradient(circle, ${INDIGO}40 0%, transparent 70%)`,
            filter: "blur(70px)",
          }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-2xl tracking-wide">Nexus IMS</span>
          </div>
        </motion.div>

        {/* Hero copy */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-base font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
            All systems operational
          </div>

          <h1 className="text-5xl font-bold text-white leading-[1.1] mb-5">
            Smart inventory
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(90deg, oklch(0.88 0.12 200), oklch(0.92 0.10 195))` }}
            >
              at your fingertips.
            </span>
          </h1>
          <p className="text-white/65 text-lg leading-relaxed max-w-sm">
            Manage stock, fulfil orders and unlock insights — inside one beautifully designed platform built for modern teams.
          </p>

          {/* Feature pills */}
          <div className="mt-10 grid grid-cols-2 gap-3.5">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.09, duration: 0.5, ease: "easeOut" }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/8 backdrop-blur-sm border border-white/12 hover:bg-white/14 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/12 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-white/85" />
                </div>
                <div>
                  <p className="text-white/90 text-base font-semibold leading-tight">{f.label}</p>
                  <p className="text-white/50 text-sm mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p className="relative z-10 text-white/35 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          © 2026 Nexus IMS. All rights reserved.
        </motion.p>
      </div>

      {/* ══════════════════════════════
          RIGHT — FORM PANEL
      ══════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute pointer-events-none" style={{ top: "-20%", right: "-15%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${INDIGO}18 0%, transparent 70%)`, filter: "blur(70px)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "-20%", left: "-10%", width: 450, height: 450, borderRadius: "50%", background: `radial-gradient(circle, ${CYAN}14 0%, transparent 70%)`, filter: "blur(70px)" }} />

        <motion.div className="w-full max-w-md relative z-10" variants={stagger} initial="hidden" animate="visible">

          {/* Mobile logo */}
          <motion.div variants={fadeUp} className="lg:hidden mb-9 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${INDIGO}, ${CYAN})` }}>
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">Nexus IMS</span>
          </motion.div>

          {/* Heading */}
          <motion.div variants={fadeUp} className="mb-9">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-lg mt-2">Sign in to continue to your dashboard.</p>
          </motion.div>

          {/* Demo Quick-Launch Banner */}
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full mb-7 group relative flex items-center justify-between px-5 py-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${INDIGO}08, ${CYAN}06)` }}
            />
            <div className="flex items-center gap-4 relative z-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${INDIGO}20, ${CYAN}15)` }}
              >
                <Zap className="w-5 h-5" style={{ color: INDIGO }} />
              </div>
              <div className="text-left">
                <p className="text-base font-bold text-foreground leading-tight">Try Demo Account</p>
                <p className="text-sm text-muted-foreground mt-0.5">No registration needed</p>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: INDIGO }} />
                </motion.span>
              ) : (
                <motion.span key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" style={{ color: INDIGO }} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Divider */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-7">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-sm font-semibold uppercase tracking-widest">or sign in</span>
            <div className="flex-1 h-px bg-border" />
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">

            {/* Email — floating label */}
            <motion.div variants={fadeUp} className="relative">
              <label
                className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 font-medium ${
                  focusedField === "email" || errors.email
                    ? "top-2 text-xs"
                    : "top-1/2 -translate-y-1/2 text-base text-muted-foreground"
                }`}
                style={focusedField === "email" || errors.email ? { color: errors.email ? "#ef4444" : INDIGO } : undefined}
              >
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                required
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                style={errors.email ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)" } : focusBorder("email")}
                className={`w-full pt-7 pb-3 px-4 rounded-2xl bg-input/30 border transition-all outline-none text-base text-foreground ${errors.email ? "border-red-500" : "border-border"}`}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm mt-1 px-1">
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password — floating label */}
            <motion.div variants={fadeUp} className="relative">
              <label
                className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 font-medium ${
                  focusedField === "password" || errors.password
                    ? "top-2 text-xs"
                    : "top-1/2 -translate-y-1/2 text-base text-muted-foreground"
                }`}
                style={focusedField === "password" || errors.password ? { color: errors.password ? "#ef4444" : INDIGO } : undefined}
              >
                Password
              </label>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                required
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={errors.password ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)" } : focusBorder("password")}
                className={`w-full pt-7 pb-3 px-4 pr-14 rounded-2xl bg-input/30 border transition-all outline-none text-base text-foreground ${errors.password ? "border-red-500" : "border-border"}`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[24px] text-muted-foreground hover:text-foreground transition-colors"
                style={{ top: focusedField === "password" || errors.password ? "24px" : "50%" }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm mt-1 px-1">
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Remember + Forgot */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-5 h-5 rounded border border-border bg-input/20 hover:border-primary/60 transition-colors" />
                <span className="text-base text-muted-foreground">Remember me</span>
              </label>
              <Link href="#" className="text-base font-semibold hover:underline" style={{ color: INDIGO }}>
                Forgot password?
              </Link>
            </motion.div>

            {/* Sign In Button */}
            <motion.div variants={fadeUp} className="pt-1">
              <motion.button
                type="submit"
                disabled={isLoading}
                className="relative w-full flex items-center justify-center gap-3 py-4 px-5 rounded-2xl font-bold text-base text-white overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${INDIGO}, oklch(0.60 0.22 245), ${CYAN})` }}
                whileHover={{ scale: 1.015, boxShadow: `0 8px 40px ${INDIGO}55, 0 0 0 1px ${INDIGO}60` }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
              >
                {/* Shimmer */}
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
                />
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </motion.span>
                  ) : (
                    <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <LogIn className="w-5 h-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="relative z-10">{isLoading ? "Signing in…" : "Sign In"}</span>
              </motion.button>
            </motion.div>
          </form>

          <motion.p variants={fadeUp} className="mt-8 text-center text-base text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold hover:underline" style={{ color: CYAN }}>
              Create one free
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-9 h-9 animate-spin" style={{ color: "oklch(0.68 0.24 262)" }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
