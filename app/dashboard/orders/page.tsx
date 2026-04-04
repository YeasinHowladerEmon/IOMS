"use client";

import React, { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useOrdersQuery,
  useUpdateStatusMutation,
  useCancelOrderMutation,
  STATUS_OPTIONS,
  type OrderStatus,
  type Order as OrderType,
  type OrderFilters,
} from "@/lib/orders";
import { useProductsQuery } from "@/lib/products";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useRefresh } from "@/hooks/use-refresh";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  Search,
  RotateCcw,
  RefreshCw,
  ShoppingCart,
  CalendarRange,
  Clock,
  Package2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Extracted Components
import { STATUS_CONFIG } from "./components/status-config";
import { OrdersTable } from "./components/orders-table";
import { StatusModal } from "./components/status-modal";
import { ViewOrderModal } from "./components/view-order-modal";
import { CreateOrderModal } from "./components/create-order-modal";

/* ── Stat Card Component ── */
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-background/40 border border-border/30 backdrop-blur-sm">
      <div className={`p-3 rounded-xl bg-current/10 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  /* ── State ── */
  const [filters, setFilters] = useState<OrderFilters>({
    searchTerm: "",
    status: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10
  });
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [statusModal, setStatusModal] = useState<{ id: string; status: OrderStatus } | null>(null);
  const [viewOrder, setViewOrder] = useState<OrderType | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  /* ── Queries ── */
  const { data: ordersResponse, isLoading, error, refetch } = useOrdersQuery(filters);
  const orders: OrderType[] = ordersResponse?.data || [];
  const meta = ordersResponse?.meta;

  const { data: productsResponse } = useProductsQuery({ limit: 1000 });
  const allProducts = productsResponse?.data || [];

  const { mutateAsync: updateStatus } = useUpdateStatusMutation();
  const { mutateAsync: cancelOrder } = useCancelOrderMutation();

  /* ── Effects ── */
  useEffect(() => {
    setFilters(prev => ({ ...prev, searchTerm: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  /* ── Handlers ── */
  const resetFilters = () => {
    setSearch("");
    setFilters({ searchTerm: "", status: "", startDate: "", endDate: "", page: 1, limit: 10 });
  };

  const { handleRefresh } = useRefresh(refetch);
  const hasActiveFilters = !!(filters.status || filters.startDate || filters.endDate || filters.searchTerm);

  /* ── Stats ── */
  const pendingCount = orders.filter(o => o.status === "PENDING").length;
  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Order Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track, manage, and fulfil your orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} isLoading={isLoading} className="h-10 w-10 rounded-xl border border-border/40">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowCreate(true)} className="h-10 px-5 rounded-xl">
            <Plus className="h-4 w-4" /> New Order
          </Button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      {!isLoading && meta && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Orders" value={meta.total} icon={<ShoppingCart className="h-5 w-5" />} color="text-primary" />
          <StatCard label="Pending" value={pendingCount} icon={<Clock className="h-5 w-5" />} color="text-amber-400" />
          <StatCard label="Page Revenue" value={`$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<TrendingUp className="h-5 w-5" />} color="text-emerald-400" />
          <StatCard label="Per Page" value={filters.limit!} icon={<Package2 className="h-5 w-5" />} color="text-sky-400" />
        </div>
      )}

      {/* ── Filters Bar ── */}
      <div className="rounded-2xl border border-border/40 bg-background/40 backdrop-blur-sm overflow-hidden">
        {/* Primary Row */}
        <div className="flex flex-wrap gap-3 p-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID or customer name…"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/30 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <select
            value={filters.status || ""}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="h-10 px-3 rounded-xl bg-muted/30 border border-border/30 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <Button 
            variant="ghost" 
            className="h-14 w-14 rounded-2xl bg-background/50 border border-border/40 hover:bg-background"
            onClick={() => {
              setSearch("");
              setFilters({ searchTerm: "", status: "", startDate: "", endDate: "", page: 1, limit: 10 });
            }}
          >
            <RefreshCw className="h-5 w-5 opacity-60" />
          </Button>
        </div>

        <div className="flex gap-2 p-1.5 bg-background/50 rounded-[1.5rem] border border-border/40">
          <div className="flex items-center gap-2 px-3 border-r border-border/20">
             <CalendarRange className="h-4 w-4 text-muted-foreground" />
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Range</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 px-4 rounded-xl text-xs font-bold transition-all",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  {filters.startDate ? format(new Date(filters.startDate), "PPP") : "Start Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate ? new Date(filters.startDate) : undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date ? format(date, "yyyy-MM-dd") : "", page: 1 }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground/30 text-xs font-bold">to</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 px-4 rounded-xl text-xs font-bold transition-all",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  {filters.endDate ? format(new Date(filters.endDate), "PPP") : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate ? new Date(filters.endDate) : undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date ? format(date, "yyyy-MM-dd") : "", page: 1 }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <XCircle className="h-12 w-12 text-destructive/60" />
          <p className="font-bold text-destructive">Failed to load orders</p>
          <p className="text-sm text-muted-foreground">{(error as any).message}</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2 h-9 px-5 rounded-xl">Try Again</Button>
        </div>
      )}

      {/* ── Main Orders Table ── */}
      <OrdersTable
        isLoading={isLoading}
        orders={orders}
        meta={meta}
        error={error}
        hasActiveFilters={hasActiveFilters}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        setViewOrder={setViewOrder}
        setStatusModal={setStatusModal}
        cancelOrder={cancelOrder}
      />

      {/* ── Modals ── */}
      <CreateOrderModal 
        isOpen={showCreate} 
        onClose={() => setShowCreate(false)} 
        allProducts={allProducts} 
      />
      
      <ViewOrderModal 
        viewOrder={viewOrder} 
        onClose={() => setViewOrder(null)} 
        onCancelOrder={cancelOrder} 
      />

      <StatusModal 
        statusModal={statusModal} 
        onClose={() => setStatusModal(null)} 
        onUpdateStatus={async (id, status) => {
          await updateStatus({ id, status });
        }}
      />
    </motion.div>
  );
}
