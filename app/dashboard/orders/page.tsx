"use client";

import React, { useState, useMemo } from "react";
import {
  useOrdersQuery,
  useCreateOrderMutation,
  useUpdateStatusMutation,
  useCancelOrderMutation,
  calcTotal,
  STATUS_OPTIONS,
  type OrderStatus,
  type OrderItem,
  type CreateOrderPayload,
} from "@/lib/orders";
import { useOverlay } from "@/lib/overlay-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  ChevronDown,
  ShoppingCart,
  Package,
  AlertTriangle,
  Loader2,
  CalendarDays,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, THead, TBody, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

/* ── Status config ── */
const STATUS_CONFIG: Record<OrderStatus, { variant: any; label: string }> = {
  Pending:   { variant: "warning", label: "Pending"   },
  Confirmed: { variant: "info",    label: "Confirmed" },
  Shipped:   { variant: "info",    label: "Shipped"   },
  Delivered: { variant: "success", label: "Delivered" },
  Cancelled: { variant: "danger",  label: "Cancelled" },
};

/* ── Empty product row ── */
const emptyItem = (): OrderItem => ({
  productId: crypto.randomUUID(),
  productName: "",
  quantity: 1,
  unitPrice: 0,
});

export default function OrdersPage() {
  const { data: orders = [], isLoading, error, refetch: refresh } = useOrdersQuery();
  const { mutateAsync: createOrder, isPending: isCreating } = useCreateOrderMutation();
  const { mutateAsync: updateStatus } = useUpdateStatusMutation();
  const { mutateAsync: cancelOrder } = useCancelOrderMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [statusModal, setStatusModal] = useState<{ id: string; status: OrderStatus } | null>(null);
  const { showAlert } = useOverlay();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [dateSort, setDateSort] = useState<"desc" | "asc">("desc");

  /* Create Form State */
  const [formCustomer, setFormCustomer] = useState("");
  const [formItems, setFormItems] = useState<OrderItem[]>([emptyItem()]);

  const displayed = useMemo(() => {
    let list = orders;
    if (statusFilter !== "All") list = list.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => o.customerName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return dateSort === "desc" ? db - da : da - db;
    });
    return list;
  }, [orders, statusFilter, search, dateSort]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrder({
        customerName: formCustomer,
        items: formItems.map(i => ({ ...i }))
      });
      setShowCreate(false);
      setFormCustomer("");
      setFormItems([emptyItem()]);
    } catch (e) {
      console.error(e);
    }
  };

  const updateItem = (idx: number, field: keyof OrderItem, value: string | number) => {
    setFormItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    STATUS_OPTIONS.forEach(s => c[s] = orders.filter(o => o.status === s).length);
    return c;
  }, [orders]);

  return (
    <motion.div className="space-y-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Orders</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {orders.length} total orders · manage the full lifecycle
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={() => refresh()} isLoading={isLoading}>
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-5 h-5" />
            New Order
          </Button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {(["All", ...STATUS_OPTIONS] as const).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "primary" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="rounded-full px-4"
          >
            {s}
            <Badge variant="outline" className="ml-1 px-1.5 py-0.5 border-white/20 bg-white/10 text-white">
              {counts[s] ?? 0}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or order ID…"
            className="pl-11"
          />
          <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
        </div>
        <Button variant="outline" onClick={() => setDateSort(d => d === "desc" ? "asc" : "desc")}>
          <CalendarDays className="w-4.5 h-4.5" />
          {dateSort === "desc" ? "Newest" : "Oldest"}
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5 text-destructive p-4">
          <div className="flex items-center gap-3 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            {(error as Error).message}
            <Button variant="ghost" size="sm" onClick={() => refresh()} className="ml-auto underline">Retry</Button>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground font-medium">Synchronizing orders…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Package className="w-16 h-16 opacity-10" />
            <p className="text-xl font-bold">No orders found</p>
            <Button onClick={() => setShowCreate(true)} className="mt-2">
              <Plus className="w-5 h-5" />
              Place First Order
            </Button>
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Order ID</TH>
                <TH>Customer</TH>
                <TH>Items</TH>
                <TH className="text-right">Total</TH>
                <TH>Status</TH>
                <TH>Date</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {displayed.map((order) => (
                <React.Fragment key={order.id}>
                  <TR onClick={() => setExpandedRow(expandedRow === order.id ? null : order.id)} className="cursor-pointer group">
                    <TD className="font-mono text-base font-bold text-primary">#{order.id.slice(-6).toUpperCase()}</TD>
                    <TD className="font-semibold text-foreground">{order.customerName}</TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
                        </Badge>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedRow === order.id ? "rotate-180" : ""}`} />
                      </div>
                    </TD>
                    <TD className="text-right font-bold text-foreground">${order.totalPrice.toFixed(2)}</TD>
                    <TD>
                      <Badge variant={STATUS_CONFIG[order.status].variant}>
                        {STATUS_CONFIG[order.status].label}
                      </Badge>
                    </TD>
                    <TD className="text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TD>
                    <TD className="text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {order.status !== "Cancelled" && order.status !== "Delivered" && (
                          <Button variant="ghost" size="sm" onClick={() => setStatusModal({ id: order.id, status: order.status })}>
                            Update
                          </Button>
                        )}
                        {order.status !== "Cancelled" && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hover:text-destructive hover:bg-destructive/10"
                            onClick={() => showAlert({
                              title: "Cancel Order?",
                              message: `Are you sure you want to cancel order #${order.id.slice(-6).toUpperCase()}?`,
                              confirmText: "Cancel Order",
                              type: "danger",
                              onConfirm: () => cancelOrder(order.id)
                            })}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </TD>
                  </TR>
                  <AnimatePresence>
                    {expandedRow === order.id && (
                      <TR className="hover:bg-transparent">
                        <TD colSpan={7} className="px-6 pb-6 pt-0">
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: "auto", opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <Card className="bg-primary/5 border-primary/20 p-0 overflow-hidden">
                              <Table>
                                <THead className="bg-primary/10">
                                  <TR className="hover:bg-transparent">
                                    <TH className="py-2.5">Product</TH>
                                    <TH className="py-2.5 text-center">Qty</TH>
                                    <TH className="py-2.5 text-right">Price</TH>
                                    <TH className="py-2.5 text-right">Subtotal</TH>
                                  </TR>
                                </THead>
                                <TBody>
                                  {order.items.map((item, i) => (
                                    <TR key={i} className="hover:bg-primary/10 border-primary/10">
                                      <TD className="py-2.5 font-medium">{item.productName}</TD>
                                      <TD className="py-2.5 text-center">{item.quantity}</TD>
                                      <TD className="py-2.5 text-right text-muted-foreground">${item.unitPrice.toFixed(2)}</TD>
                                      <TD className="py-2.5 text-right font-bold">${(item.quantity * item.unitPrice).toFixed(2)}</TD>
                                    </TR>
                                  ))}
                                </TBody>
                              </Table>
                            </Card>
                          </motion.div>
                        </TD>
                      </TR>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      {/* Create Modal */}
      <Modal 
        isOpen={showCreate} 
        onClose={() => setShowCreate(false)} 
        title="Create New Order" 
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <Input 
            label="Customer Name" 
            required 
            value={formCustomer} 
            onChange={e => setFormCustomer(e.target.value)} 
          />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-foreground/80">Order Items</label>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormItems([...formItems, emptyItem()])}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {formItems.map((item, idx) => (
              <div key={item.productId} className="flex gap-2 items-center">
                <Input 
                  placeholder="Product" 
                  value={item.productName} 
                  onChange={e => updateItem(idx, "productName", e.target.value)} 
                  className="flex-1"
                />
                <Input 
                  type="number" 
                  className="w-20" 
                  value={item.quantity} 
                  onChange={e => updateItem(idx, "quantity", Number(e.target.value))} 
                />
                <Input 
                  type="number" 
                  step="0.01" 
                  className="w-24" 
                  value={item.unitPrice} 
                  onChange={e => updateItem(idx, "unitPrice", Number(e.target.value))} 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  disabled={formItems.length === 1}
                  onClick={() => setFormItems(formItems.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex justify-between items-center">
            <span className="font-bold">Total Amount</span>
            <span className="text-xl font-bold text-primary">${calcTotal(formItems).toFixed(2)}</span>
          </div>

          <Button type="submit" className="w-full" isLoading={isCreating}>
            Create Order
          </Button>
        </form>
      </Modal>

      {/* Status Modal */}
      <Modal 
        isOpen={!!statusModal} 
        onClose={() => setStatusModal(null)} 
        title="Update Status"
      >
        <div className="space-y-3">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => {
                updateStatus({ id: statusModal!.id, status });
                setStatusModal(null);
              }}
              className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between ${
                statusModal?.status === status 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-input/20 border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              <span className="font-bold">{status}</span>
              {statusModal?.status === status && <Badge variant="info" className="bg-primary text-white border-none">Current</Badge>}
            </button>
          ))}
        </div>
      </Modal>
    </motion.div>
  );
}
