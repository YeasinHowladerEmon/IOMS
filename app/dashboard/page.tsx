"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');

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
      title: "Revenue Today",
      value: `$${stats?.insights?.revenueToday?.toLocaleString() || "0"}`,
      change: "Today",
      isPositive: true,
      icon: DollarSign,
      variant: "primary" as const,
    },
    {
      title: "Orders Today",
      value: stats?.insights?.totalOrdersToday?.toLocaleString() || "0",
      change: "Today",
      isPositive: true,
      icon: ShoppingCart,
      variant: "info" as const,
    },
    {
      title: "Pending Orders",
      value: stats?.insights?.pendingOrders?.toLocaleString() || "0",
      change: "Active",
      isPositive: false,
      icon: Clock,
      variant: "warning" as const,
    },
    {
      title: "Low Stock",
      value: stats?.insights?.lowStockItemsCount?.toLocaleString() || "0",
      change: "Critical",
      isPositive: false,
      icon: AlertCircle,
      variant: "danger" as const,
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
             <span className="text-xs font-black uppercase tracking-widest text-primary">Live IOMS System</span>
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
              <Badge variant={stat.variant as any} className="rounded-full px-3 py-1 font-bold">
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

      {/* ── Order Status Logic Card ── */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-8 max-sm:flex-col max-sm:items-start gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tight">Order Fulfillment</h2>
            <p className="text-muted-foreground font-medium">Pending vs Completed Distribution</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-warning/5 px-3 py-1.5 rounded-full border border-warning/10">
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-warning">Pending</span>
            </div>
            <div className="flex items-center gap-2 bg-success/5 px-3 py-1.5 rounded-full border border-success/10">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[10px] font-black uppercase tracking-widest text-success">Completed</span>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group cursor-default">
              <div className="absolute inset-0 bg-warning/5 rounded-3xl blur-xl group-hover:bg-warning/10 transition-colors" />
              <div className="relative p-6 rounded-3xl border border-warning/10 bg-background/40 backdrop-blur-sm flex items-center justify-between overflow-hidden">
                <div>
                  <p className="text-[10px] font-black text-warning uppercase tracking-widest mb-1">Awaiting Action</p>
                  <h3 className="text-4xl font-black text-foreground tracking-tighter">
                    {stats?.insights?.pendingOrders || 0}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground mt-1 underline decoration-warning/30 decoration-2 underline-offset-4 cursor-default">Needs fulfillment</p>
                </div>
                <div className="p-4 rounded-2xl bg-warning/10 text-warning group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="relative group cursor-default">
              <div className="absolute inset-0 bg-success/5 rounded-3xl blur-xl group-hover:bg-success/10 transition-colors" />
              <div className="relative p-6 rounded-3xl border border-success/10 bg-background/40 backdrop-blur-sm flex items-center justify-between overflow-hidden">
                <div>
                  <p className="text-[10px] font-black text-success uppercase tracking-widest mb-1">Success Flow</p>
                  <h3 className="text-4xl font-black text-foreground tracking-tighter">
                    {stats?.insights?.completedOrders || 0}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground mt-1 underline decoration-success/30 decoration-2 underline-offset-4 cursor-default">Ready & Delivered</p>
                </div>
                <div className="p-4 rounded-2xl bg-success/10 text-success group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative pt-4">
             <div className="h-4 w-full bg-muted/20 rounded-full overflow-hidden flex border border-border/10 p-0.5">
                {(() => {
                  const pending = stats?.insights?.pendingOrders || 0;
                  const completed = stats?.insights?.completedOrders || 0;
                  const total = pending + completed || 1;
                  const pendingPct = (pending / total) * 100;
                  const completedPct = (completed / total) * 100;
                  return (
                    <>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pendingPct}%` }}
                        className="h-full bg-warning rounded-l-full relative"
                        transition={{ duration: 1.5, ease: "circOut" }}
                      >
                         <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent" />
                      </motion.div>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${completedPct}%` }}
                        className="h-full bg-success rounded-r-full relative"
                        transition={{ duration: 1.5, ease: "circOut", delay: 0.3 }}
                      >
                         <div className="absolute inset-0 bg-linear-to-l from-white/20 to-transparent" />
                      </motion.div>
                    </>
                  );
                })()}
             </div>
             <div className="flex justify-between mt-4 px-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                   Lifecycle Analysis: <span className="text-foreground">{(stats?.insights?.pendingOrders || 0) + (stats?.insights?.completedOrders || 0)}</span> ACTIVE ORDERS
                </p>
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#6366f1] animate-pulse" />
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest">IOMS Sync</p>
                </div>
             </div>
          </div>
        </div>
      </Card>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* Revenue Bar Chart */}
        <Card className="xl:col-span-3 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tight">
                {chartMetric === 'revenue' ? 'Revenue Stream' : 'Order Volume'}
              </h2>
              <p className="text-muted-foreground font-medium">Last 7 days performance</p>
            </div>
            <div className="flex bg-muted/20 p-1 rounded-xl border border-border/10">
              <button 
                onClick={() => setChartMetric('revenue')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartMetric === 'revenue' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Revenue
              </button>
              <button 
                onClick={() => setChartMetric('orders')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartMetric === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Orders
              </button>
            </div>
          </div>

          <div className="flex items-end gap-3 h-56 pt-10">
            {(stats?.revenueAnalytics || []).map((bar, i) => {
              const value = chartMetric === 'revenue' ? bar.revenue : bar.orderCount;
              const max = Math.max(...(stats?.revenueAnalytics.map(d => chartMetric === 'revenue' ? d.revenue : d.orderCount) || [1]));
              const pct = (value / max) * 100;
              const dayLabel = bar.date.split('-').slice(1).join('/'); // MM/DD
              return (
                <div key={bar.date} className="flex-1 flex flex-col items-center gap-3 group relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none uppercase tracking-tighter">
                    {chartMetric === 'revenue' ? `$${bar.revenue.toLocaleString()}` : `${bar.orderCount} Orders`}
                  </div>
                  <div className="w-full flex flex-col justify-end h-40 bg-muted/20 rounded-t-2xl overflow-hidden border border-border/10">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      className="w-full bg-primary relative group-hover:brightness-110 transition-all"
                      transition={{ delay: i * 0.05, duration: 0.8, ease: "circOut" }}
                    >
                       <div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-white/30 to-transparent" />
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="xl:col-span-2 p-8 overflow-hidden">
          <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tight mb-8">Stock Status</h2>
          <div className="space-y-7">
            {(stats?.productSummary || []).slice(0, 5).map((p, i) => (
              <div key={i} className="group cursor-default">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{p.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                      {p.stockQuantity} {p.stockQuantity === 0 ? "none left" : "left"}
                    </span>
                    <Badge 
                      variant={
                        p.status === 'Excellent' ? 'success' : 
                        p.status === 'Very Good' ? 'success' : 
                        p.status === 'OK' ? 'info' : 
                        p.status === 'Low Stock' ? 'warning' : 'danger'
                      } 
                      className={`font-mono font-black text-[10px] uppercase tracking-tighter px-2 py-0 ${
                        p.status === 'Excellent' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 
                        p.status === 'Very Good' ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''
                      }`}
                    >
                      {p.status === 'Excellent' ? "EXCELLENT" : p.status === 'Very Good' ? "VERY GOOD" : p.status === 'OK' ? "OK STATUS" : p.status === 'Low Stock' ? "LOW STOCK" : "VERY LOW"}
                    </Badge>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-muted/40 overflow-hidden relative border border-border/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((p.stockQuantity / 100) * 100, 100)}%` }}
                    className={`h-full ${
                      p.status === 'Very Low' ? 'bg-destructive' : 
                      p.status === 'Low Stock' ? 'bg-warning' : 
                      p.status === 'OK' ? 'bg-blue-400' :
                      p.status === 'Very Good' ? 'bg-green-500' : 'bg-emerald-500'
                    }`}
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
        <div className="flex items-center justify-between mb-8 max-sm:flex-col max-sm:items-start gap-4">
           <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tight">System Pulse</h2>
           <Link href="/dashboard/activity-logs">
             <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10 group/link">
               See All Events 
               <ArrowUpRight className="w-4 h-4 ml-2 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
             </Button>
           </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {(stats?.recentActivities || []).map((act, i) => (
             <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-muted/10 border border-border/50 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                   <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-base font-bold text-foreground truncate">
                     {act.message}
                   </p>
                   <div className="flex items-center gap-2 mt-1">
                     <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                       {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </p>
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
