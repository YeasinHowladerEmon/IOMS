"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupValues } from "@/lib/validation";
import { useAuth } from "@/lib/auth-context";
import { UserPlus, Loader2, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
  const { signup, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  const handleSignup = async (data: SignupValues) => {
    setIsLoading(true);
    try {
      await signup(data);
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message || "Something went wrong.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background glowing orbs */}
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-6 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
            <UserCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold font-outfit text-foreground tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm">
            Join us and start managing your dashboard today.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleSignup)} className="space-y-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.name ? "text-destructive" : "text-foreground"}`}>
                Full Name
              </label>
              <input
                {...register("name")}
                type="text"
                required
                className={`w-full px-4 py-3 rounded-lg bg-input/50 border transition-all outline-none placeholder:text-muted-foreground text-foreground ${
                  errors.name ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
                placeholder="John Doe"
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-destructive text-xs mt-1.5 font-medium">
                    {errors.name.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.email ? "text-destructive" : "text-foreground"}`}>
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                required
                className={`w-full px-4 py-3 rounded-lg bg-input/50 border transition-all outline-none placeholder:text-muted-foreground text-foreground ${
                  errors.email ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
                placeholder="name@example.com"
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-destructive text-xs mt-1.5 font-medium">
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.password ? "text-destructive" : "text-foreground"}`}>
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                required
                className={`w-full px-4 py-3 rounded-lg bg-input/50 border transition-all outline-none placeholder:text-muted-foreground text-foreground ${
                  errors.password ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
                placeholder="••••••••"
              />
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-destructive text-xs mt-1.5 font-medium">
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-[0_4px_14px_0_rgba(var(--primary-rgb),0.39)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
