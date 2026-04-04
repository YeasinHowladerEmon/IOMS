import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShoppingCart, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Order as OrderType, type OrderFilters, type OrderStatus } from "@/lib/orders";
import { STATUS_CONFIG } from "./status-config";
import { useOverlay } from "@/lib/overlay-context";

interface OrdersTableProps {
  isLoading: boolean;
  orders: OrderType[];
  meta: any; // Or proper pagination metadata type
  error: any;
  hasActiveFilters: boolean;
  filters: OrderFilters;
  setFilters: React.Dispatch<React.SetStateAction<OrderFilters>>;
  resetFilters: () => void;
  setViewOrder: (order: OrderType) => void;
  setStatusModal: (modal: { id: string; status: OrderStatus }) => void;
  cancelOrder: (id: string) => void;
}

export function OrdersTable({
  isLoading,
  orders,
  meta,
  error,
  hasActiveFilters,
  filters,
  setFilters,
  resetFilters,
  setViewOrder,
  setStatusModal,
  cancelOrder
}: OrdersTableProps) {
  const { showAlert } = useOverlay();

  if (error) {
    return null; // The error state is handled by the parent currently
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-background/40 backdrop-blur-sm overflow-hidden">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
          <p className="text-sm font-semibold text-muted-foreground">Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="p-6 rounded-2xl bg-muted/10 border border-dashed border-border/50">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/20" />
          </div>
          <div>
            <p className="font-bold text-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
          {hasActiveFilters && <Button variant="outline" onClick={resetFilters} className="h-9 px-5 rounded-xl">Clear Filters</Button>}
        </div>
      ) : (
        <>
          {/* Table Head */}
          <div className="grid grid-cols-[1fr_1.2fr_80px_100px_120px_100px] gap-4 px-6 py-3 border-b border-border/30 bg-muted/10">
            {["Order", "Customer", "Items", "Total", "Status", "Actions"].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <AnimatePresence>
            {orders.map((order, idx) => {
              const cfg = STATUS_CONFIG[order.status];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setViewOrder(order)}
                  className="grid grid-cols-[1fr_1.2fr_80px_100px_120px_100px] gap-4 items-center px-6 py-4 border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors group cursor-pointer"
                >
                  {/* Order ID + Date */}
                  <div>
                    <p className="text-xs font-black font-mono text-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase flex-shrink-0">
                      {order.customerName.charAt(0)}
                    </div>
                    <span className="font-semibold text-sm text-foreground truncate capitalize">{order.customerName}</span>
                  </div>

                  {/* Items */}
                  <div>
                    <span className="text-sm font-bold text-foreground">{order.orderItems.length}</span>
                    <span className="text-xs text-muted-foreground"> {order.orderItems.length === 1 ? "item" : "items"}</span>
                  </div>

                  {/* Total */}
                  <p className="text-sm font-black text-foreground">
                    ${order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>

                  {/* Status */}
                  <button onClick={(e) => { e.stopPropagation(); setStatusModal({ id: order.id, status: order.status }); }} className="text-left">
                    <Badge variant={cfg.variant} className="gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                      <span className={cfg.color}>{cfg.icon}</span>
                      {cfg.label}
                    </Badge>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewOrder(order); }}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showAlert({
                            title: "Cancel Order?",
                            message: "This will restore stock and mark the order as cancelled.",
                            confirmText: "Cancel Order",
                            type: "danger",
                            onConfirm: () => cancelOrder(order.id),
                          });
                        }}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all"
                        title="Cancel Order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Pagination */}
          {meta && meta.total > meta.limit && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-bold text-foreground">{((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-bold text-foreground">{meta.total}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline" size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.ceil(meta.total / meta.limit) }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === Math.ceil(meta.total / meta.limit) || Math.abs(p - meta.page) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="text-muted-foreground text-xs px-1">…</span>}
                      <Button
                        variant={meta.page === p ? "primary" : "ghost"} size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                        className="h-8 w-8 p-0 rounded-lg font-bold text-xs"
                      >
                        {p}
                      </Button>
                    </React.Fragment>
                  ))}
                <Button
                  variant="outline" size="sm"
                  disabled={meta.page >= Math.ceil(meta.total / meta.limit)}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
