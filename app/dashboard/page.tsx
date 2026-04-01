"use client";

import { useAuth } from "@/lib/auth-context";
import { useDashboardStatsQuery } from "@/lib/dashboard";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  CheckCircle2,
  Clock,
  Activity,
  AlertCircle,
  Loader2,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const INDIGO = "oklch(0.68 0.24 262)";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading, error, refetch } = useDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse rounded-full" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-foreground">Synchronizing Intelligence</p>
          <p className="text-muted-foreground">Fetching the latest workspace metrics…</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toLocaleString() || "0"}`,
      change: `${(stats?.revenueChange ?? 0) > 0 ? "+" : ""}${stats?.revenueChange ?? 0}%`,
      isPositive: (stats?.revenueChange ?? 0) >= 0,
      icon: DollarSign,
      variant: "primary" as const,
    },
    {
      title: "Active Orders",
      value: stats?.totalOrders?.toLocaleString() || "0",
      change: `${(stats?.ordersChange ?? 0) > 0 ? "+" : ""}${stats?.ordersChange ?? 0}%`,
      isPositive: (stats?.ordersChange ?? 0) >= 0,
      icon: ShoppingCart,
      variant: "info" as const,
    },
    {
      title: "Total Products",
      value: stats?.totalProducts?.toLocaleString() || "0",
      change: `${(stats?.stockChange ?? 0) > 0 ? "+" : ""}${stats?.stockChange ?? 0}%`,
      isPositive: (stats?.stockChange || 0) >= 0,
      icon: Package,
      variant: "warning" as const,
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers?.toLocaleString() || "0",
      change: `${(stats?.customersChange ?? 0) > 0 ? "+" : ""}${stats?.customersChange ?? 0}%`,
      isPositive: (stats?.customersChange || 0) >= 0,
      icon: Users,
      variant: "success" as const,
    },
  ];

  return (
    <motion.div 
      className="space-y-8 pb-10" 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ── Heading ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic">Overview</h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium">
            Welcome back, <span className="text-foreground font-bold underline decoration-primary/30 decoration-4 underline-offset-4">{user?.name}</span>.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="outline" size="icon" onClick={() => refetch()} isLoading={isLoading}>
             <RefreshCcw className="w-5 h-5" />
           </Button>
           <Badge variant="outline" className="px-4 py-2 border-primary/20 bg-primary/5 hidden sm:flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
             <span className="text-xs font-black uppercase tracking-widest text-primary">Live Nexus System</span>
           </Badge>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((stat, i) => (
          <Card
            key={i}
            className="p-6 group relative overflow-hidden active:scale-[0.98] transition-transform"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <Badge variant={stat.isPositive ? "success" : "danger"} className="rounded-full px-3 py-1 font-bold">
                {stat.isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {stat.change}
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
            </div>
            {/* Background design element */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <stat.icon className="w-24 h-24 rotate-12" />
            </div>
          </Card>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* Revenue Bar Chart */}
        <Card className="xl:col-span-3 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tight">Revenue Stream</h2>
              <p className="text-muted-foreground font-medium">Last 7 days performance</p>
            </div>
            <TrendingUp className="w-6 h-6 text-primary opacity-50" />
          </div>

          <div className="flex items-end gap-3 h-56 pt-10">
            {(stats?.revenueByDay || []).map((bar, i) => {
              const max = Math.max(...(stats?.revenueByDay.map(d => d.revenue) || [1]));
              const pct = (bar.revenue / max) * 100;
              return (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-3 group relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none uppercase tracking-tighter">
                    ${bar.revenue.toLocaleString()}
                  </div>
                  <div className="w-full flex flex-col justify-end h-40 bg-muted/20 rounded-t-2xl overflow-hidden border border-border/10">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      className="w-full bg-primary relative group-hover:brightness-110 transition-all"
                      transition={{ delay: i * 0.05, duration: 0.8, ease: "circOut" }}
                    >
                       <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">{bar.day}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="xl:col-span-2 p-8 overflow-hidden">
          <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tight mb-8">Market Leaders</h2>
          <div className="space-y-7">
            {(stats?.topProducts || []).map((p, i) => (
              <div key={i} className="group cursor-default">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{p.name}</p>
                  <Badge variant="outline" className="font-mono font-bold text-xs border-primary/20 text-primary">
                    ${p.revenue.toLocaleString()}
                  </Badge>
                </div>
                <div className="w-full h-2.5 rounded-full bg-muted/40 overflow-hidden relative border border-border/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.pct}%` }}
                    className="h-full bg-primary"
                    transition={{ delay: 0.3 + (i * 0.1), duration: 1, ease: "circOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Recent Activity ── */}
      <Card className="p-8">
        <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tight mb-8">System Pulse</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {(stats?.recentActivity || []).map((act, i) => (
             <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-muted/10 border border-border/50 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                   <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-base font-bold text-foreground truncate">
                     {act.userName} 
                     <span className="font-medium text-muted-foreground ml-1">performed {act.action}</span>
                   </p>
                   <div className="flex items-center gap-2 mt-1">
                     <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{act.time}</p>
                   </div>
                </div>
                <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity uppercase text-[10px] hidden sm:flex">
                  Tracked
                </Badge>
             </div>
           ))}
        </div>
      </Card>
    </motion.div>
  );
}
