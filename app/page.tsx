"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Package, 
  ChevronRight, 
  BarChart3, 
  Zap, 
  Shield, 
  Box, 
  ArrowUpRight, 
  Users, 
  Globe, 
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── BRAND COLORS ─── */
const INDIGO = "oklch(0.68 0.24 262)";
const CYAN   = "oklch(0.78 0.18 205)";

const features = [
  {
    icon: BarChart3,
    title: "AI-Powered Analytics",
    desc: "Predict stock shortages and optimization opportunities with built-in machine learning.",
    color: INDIGO
  },
  {
    icon: Zap,
    title: "Lightning Workflow",
    desc: "Sub-second order processing and real-time inventory updates across all channels.",
    color: CYAN
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "Role-based access, audit logs, and bank-grade data encryption out of the box.",
    color: INDIGO
  },
  {
    icon: Globe,
    title: "Global Scalability",
    desc: "Supports multi-warehouse management and international currency/tax handling.",
    color: CYAN
  }
];

const stats = [
  { label: "Active Users", value: "10k+", icon: Users },
  { label: "Orders Monthly", value: "2.4M", icon: Box },
  { label: "System Uptime", value: "99.9%", icon: Zap },
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-5">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Nexus IMS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-semibold hover:text-white/80 transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all shadow-xl active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-indigo-500/20 blur-[120px] -z-10 rounded-full" />
        <div className="absolute top-[10%] right-[-10%] w-96 h-96 bg-cyan-400/10 blur-[100px] -z-10 rounded-full animate-pulse" />

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              v2.0 is now live
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
              Inventory management <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-cyan-400 to-indigo-400 animate-gradient-x">
                reinvented.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-white/50 text-xl leading-relaxed mb-12">
              The industry standard for modern logistics. Powerful analytics, seamless workflows, and enterprise-grade security in a stunning dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link 
                href="/signup"
                className="group relative px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg flex items-center gap-2 hover:scale-[1.02] transition-all overflow-hidden"
              >
                Start for free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login"
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Schedule Demo
              </Link>
            </div>
          </motion.div>

          {/* MOCKUP PREVIEW */}
          <motion.div 
            style={{ opacity, scale }}
            className="mt-24 relative max-w-6xl mx-auto"
          >
            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent z-10" />
            <div className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm bg-white/5">
              <Image 
                src="/nexus_dashboard_mockup.png" 
                alt="Nexus Dashboard" 
                width={1200} 
                height={800} 
                className="w-full h-auto opacity-80"
              />
            </div>
            
            {/* Floating UI Bits */}
            <div className="absolute -left-10 top-1/4 hidden lg:block">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-bounce-slow">
                <BarChart3 className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <div className="absolute -right-8 bottom-1/4 hidden lg:block">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-float">
                <LayoutDashboard className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="py-24 border-y border-white/10 bg-white/2">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((s, i) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center md:text-left flex flex-col md:flex-row items-center gap-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                <s.icon className="w-6 h-6 text-white/70" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-white/40 font-medium uppercase tracking-widest text-xs mt-1">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section id="features" className="py-32 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-indigo-500/5 blur-[120px] -z-10 rounded-full" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Built for scale.</h2>
            <p className="text-white/40 text-xl max-w-2xl mx-auto">
              Engineered with modern technologies to handle millions of data points effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white/3 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors" style={{ backgroundColor: `${f.color}20` }}>
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center bg-linear-to-br from-indigo-600 to-indigo-900 border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_50%)]" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
              Ready to transform <br className="hidden md:block" /> your inventory?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link 
                href="/signup"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-indigo-600 font-black text-xl hover:scale-105 transition-all shadow-2xl"
              >
                Get Started Now
              </Link>
              <Link 
                href="/login"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/10 border border-white/20 text-white font-black text-xl hover:bg-white/20 transition-all backdrop-blur-lg"
              >
                Log In
              </Link>
            </div>
            <p className="mt-10 text-white/60 font-medium">Join 5,000+ businesses growing with Nexus IMS.</p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer id="about" className="py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-bold text-xl text-white/50">Nexus IMS</span>
          </div>
          
          <div className="text-white/30 text-sm font-medium">
            © 2026 Nexus Systems Inc. Built with ❤️ for modern commerce.
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-white/40 hover:text-white transition-colors"><ArrowUpRight className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>

      {/* CSS Utility for custom animations */}
      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
}
