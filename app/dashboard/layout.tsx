"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  TrendingUp,
  ChevronRight,
  Layers,
  Truck,
  History,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useOverlay } from "@/lib/overlay-context";
import type { Variants } from "framer-motion";

/* ─── BRAND COLORS ─── */
const INDIGO = "oklch(0.68 0.24 262)";
const CYAN   = "oklch(0.78 0.18 205)";

const navigation = [
  { name: "Overview",   href: "/dashboard",               icon: LayoutDashboard },
  { name: "Products",   href: "/dashboard/products",      icon: Package         },
  { name: "Categories", href: "/dashboard/categories",    icon: Layers          },
  { name: "Orders",     href: "/dashboard/orders",        icon: ShoppingCart    },
  { name: "Restock",    href: "/dashboard/restock-queue", icon: Truck           },
  { name: "Activity",   href: "/dashboard/activity-logs", icon: History         },
  { name: "Settings",   href: "#",                        icon: Settings        },
];

const slideIn: Variants = {
  hidden: { opacity: 0, width: 0 },
  visible: { opacity: 1, width: "auto", transition: { duration: 0.2 } },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const { showAlert } = useOverlay();
  const router   = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen,  setIsMobileOpen]  = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?next=" + encodeURIComponent(pathname));
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-border opacity-40" />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-[oklch(0.68_0.24_262)] animate-spin"
              style={{ borderTopColor: INDIGO }}
            />
          </div>
          <p className="text-lg text-muted-foreground font-medium animate-pulse">Loading workspace…</p>
        </div>
      </div>
    );
  }

  /* ─── Shared sidebar content ─── */
  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {/* Logo */}
      <div className="h-[70px] flex items-center px-4 border-b border-border/50 shrink-0">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${INDIGO}, ${CYAN})` }}
        >
          <Package className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="overflow-hidden ml-3"
            >
              <span
                className="text-xl font-bold whitespace-nowrap text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(90deg, ${INDIGO}, ${CYAN})` }}
              >
                IOMS
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-2.5 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3.5 py-3 rounded-2xl transition-all duration-150 group relative ${
                isActive ? "" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${INDIGO}20, ${CYAN}12)`,
                    border: `1px solid ${INDIGO}35`,
                  }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
                />
              )}
              <item.icon
                className="w-5 h-5 shrink-0 relative z-10"
                style={isActive ? { color: INDIGO } : undefined}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="ml-3.5 text-base font-semibold relative z-10 overflow-hidden whitespace-nowrap"
                    style={isActive ? { color: INDIGO } : undefined}
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !collapsed && (
                <ChevronRight className="w-4 h-4 ml-auto relative z-10" style={{ color: `${INDIGO}90` }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-border/50 shrink-0 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-muted/40 border border-border/30">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 shadow"
              style={{ background: `linear-gradient(135deg, ${INDIGO}, ${CYAN})` }}
            >
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground truncate leading-tight">{user.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">Administrator</p>
            </div>
          </div>
        )}
        <button
          onClick={() => showAlert({
            title: "Sign Out?",
            message: "Are you sure you want to end your current session?",
            confirmText: "Sign Out",
            cancelText: "Stay",
            type: "warning",
            onConfirm: logout
          })}
          className="flex items-center w-full px-3.5 py-3 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                variants={slideIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="ml-3.5 text-base font-semibold overflow-hidden whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">

      {/* ─── RICH BACKGROUND ─── */}
      {/*  Three-layer mesh: indigo blob top-left, cyan blob bottom-right, subtle grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Indigo blob */}
        <div
          style={{
            position: "absolute", top: "-10%", left: "5%",
            width: "650px", height: "650px", borderRadius: "50%",
            background: `radial-gradient(circle, ${INDIGO}22 0%, transparent 70%)`,
            filter: "blur(90px)",
          }}
        />
        {/* Cyan blob */}
        <div
          style={{
            position: "absolute", bottom: "-10%", right: "5%",
            width: "600px", height: "600px", borderRadius: "50%",
            background: `radial-gradient(circle, ${CYAN}18 0%, transparent 70%)`,
            filter: "blur(90px)",
          }}
        />
        {/* Subtle dot-grid overlay */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(oklch(0.96 0 0 / 0.055) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ─── Desktop Sidebar ─── */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 256 : 72 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="hidden md:flex flex-col relative z-20 shrink-0"
        style={{
          background: "oklch(0.12 0.022 252 / 0.85)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid oklch(0.22 0.022 252)",
          boxShadow: "4px 0 30px oklch(0 0 0 / 0.15)",
        }}
      >
        <SidebarContent collapsed={!isSidebarOpen} />
      </motion.aside>

      {/* ─── Mobile Drawer ─── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 left-0 w-64 flex flex-col z-40 md:hidden"
              style={{
                background: "oklch(0.12 0.022 252)",
                borderRight: "1px solid oklch(0.22 0.022 252)",
              }}
            >
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">

        {/* Top Header */}
        <header
          className="h-[70px] flex items-center justify-between px-5 md:px-8 sticky top-0 z-20 shrink-0"
          style={{
            background: "oklch(0.12 0.022 252 / 0.80)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid oklch(0.22 0.022 252)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Desktop toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex p-2.5 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Mobile open */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2.5 rounded-xl text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="text"
                placeholder="Search anything…"
                className="pl-10 pr-5 py-2.5 text-base bg-muted/30 border border-border/50 rounded-full w-64 focus:outline-none focus:ring-2 focus:border-primary/60 transition-all text-foreground placeholder:text-muted-foreground/55"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <button className="relative p-2.5 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full shadow-[0_0_8px_oklch(0.68_0.24_262)]"
                style={{ backgroundColor: INDIGO }}
              />
            </button>

            <div className="h-7 w-px bg-border/50 mx-1 hidden md:block" />

            {/* User */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="hidden md:block text-right">
                <p className="text-base font-bold text-foreground leading-tight">{user.name}</p>
                <p className="text-sm text-muted-foreground">Admin</p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg ring-2 ring-offset-2 ring-offset-background transition-all ring-primary/30 group-hover:ring-primary/60"
                style={{
                  background: `linear-gradient(135deg, ${INDIGO}, ${CYAN})`,
                }}
              >
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-5 md:p-8 max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
