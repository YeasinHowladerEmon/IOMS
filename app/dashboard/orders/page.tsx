"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useOrdersQuery,
  useCreateOrderMutation,
  useUpdateStatusMutation,
  useCancelOrderMutation,
  calcTotal,
  STATUS_OPTIONS,
  type OrderStatus,
  type Order as OrderType,
  type CreateOrderPayload,
  type OrderFilters,
} from "@/lib/orders";
import { useProductsQuery, type Product } from "@/lib/products";
import { useOverlay } from "@/lib/overlay-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Package,
  AlertTriangle,
  Loader2,
  CalendarDays,
  ArrowUpDown,
  Edit,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, THead, TBody, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<OrderStatus, { variant: any; label: string }> = {
  PENDING: { variant: "warning", label: "Pending" },
  CONFIRMED: { variant: "info", label: "Confirmed" },
  SHIPPED: { variant: "info", label: "Shipped" },
  DELIVERED: { variant: "success", label: "Delivered" },
  CANCELLED: { variant: "danger", label: "Cancelled" },
};

/* ── UI Item Type ── */
interface UIOrderItem {
  tempId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

const emptyItem = (): UIOrderItem => ({
  tempId: crypto.randomUUID(),
  productId: "",
  productName: "",
  quantity: 1,
  unitPrice: 0,
});

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>({
    searchTerm: "",
    status: "",
    page: 1,
    limit: 10
  });

  const { data: ordersResponse, isLoading, error, refetch: refresh } = useOrdersQuery(filters);
  const orders = ordersResponse?.data || [];
  const meta = ordersResponse?.meta;

  const { data: productsResponse } = useProductsQuery({ limit: 1000 });
  const allProducts = productsResponse?.data || [];
  
  const { mutateAsync: createOrder, isPending: isCreating } = useCreateOrderMutation();
  const { mutateAsync: updateStatus } = useUpdateStatusMutation();
  const { mutateAsync: cancelOrder } = useCancelOrderMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [statusModal, setStatusModal] = useState<{ id: string; status: OrderStatus } | null>(null);
  const [viewOrder, setViewOrder] = useState<OrderType | null>(null);
  const { showAlert } = useOverlay();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setFilters(prev => ({ ...prev, searchTerm: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  /* Create Form State */
  const [formCustomer, setFormCustomer] = useState("");
  const [formItems, setFormItems] = useState<UIOrderItem[]>([emptyItem()]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validItems = formItems
        .filter(item => item.productId !== "")
        .map(({ tempId, ...rest }) => rest);

      if (validItems.length === 0) {
        showAlert({
          title: "Empty Order",
          message: "Please add at least one product to the order.",
          type: "warning"
        });
        return;
      }

      // Check for duplicate products
      const productIds = validItems.map(i => i.productId);
      if (new Set(productIds).size !== productIds.length) {
        showAlert({
          title: "Duplicate Products",
          message: "This product is already added to the order. Please adjust the quantity instead.",
          type: "warning"
        });
        return;
      }

      // Check for unavailable products
      for (const item of validItems) {
        const product = allProducts.find(p => p.id === item.productId);
        if (product && product.status !== "ACTIVE") {
          showAlert({
            title: "Product Unavailable",
            message: `This product is currently unavailable: ${product.name}`,
            type: "danger"
          });
          return;
        }
      }

      // Check stock availability (aggregate by product ID)
      const aggregated = validItems.reduce((acc, item) => {
        acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>);

      for (const [productId, totalQty] of Object.entries(aggregated)) {
        const product = allProducts.find(p => p.id === productId);
        if (product && product.stockQuantity < totalQty) {
          showAlert({
            title: "Insufficient Stock",
            message: `${product.name} has only ${product.stockQuantity} items in stock. Requested: ${totalQty}`,
            type: "danger"
          });
          return;
        }
      }

      const payload: CreateOrderPayload = {
        customerName: formCustomer, 
        items: validItems 
      };

      await createOrder(payload);
      setShowCreate(false);
      setFormCustomer("");
      setFormItems([emptyItem()]);
    } catch (err: any) {
      // Error handled by mutation logic
    }
  };

  const handleItemChange = (idx: number, field: keyof UIOrderItem, value: any) => {
    const next = [...formItems];
    next[idx] = { ...next[idx], [field]: value };

    // Auto-update price when product changes
    if (field === "productId" && value !== "") {
      const prod = allProducts.find(p => p.id === value);
      if (prod) {
        next[idx].unitPrice = prod.price;
        next[idx].productName = prod.name;
      }
    }
    setFormItems(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Orders</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Manage your sales pipeline and fulfillment
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-background/50 hover:bg-background h-12 w-12" onClick={() => refresh()} isLoading={isLoading}>
              <RefreshCw className="h-5 w-5" />
           </Button>
           <Button onClick={() => setShowCreate(true)} className="h-12 px-6 rounded-2xl shadow-lg shadow-primary/25 h-12">
              <Plus className="mr-2 h-5 w-5" />
              Place New Order
           </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-muted/20 p-4 rounded-[2rem] border border-border/50">
        <div className="relative flex-1 min-w-[320px]">
           <Input
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search Order ID or Customer Name..."
             className="pl-12 h-14 bg-background/50 border-border/40 hover:border-primary/30 focus:bg-background transition-all rounded-[1.5rem]"
           />
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
        </div>
        
        <div className="flex gap-3">
          <Select
            value={filters.status || ""}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="h-14 w-48 bg-background/50 rounded-[1.5rem] border-border/40 font-bold"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>

          <Button 
            variant="ghost" 
            className="h-14 w-14 rounded-2xl bg-background/50 border border-border/40 hover:bg-background"
            onClick={() => {
              setSearch("");
              setFilters({ searchTerm: "", status: "", page: 1, limit: 10 });
            }}
          >
            <RefreshCw className="h-5 w-5 opacity-60" />
          </Button>
        </div>
      </div>

      {/* Data Section */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5 p-6 rounded-[2rem] flex flex-col items-center gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive animate-bounce" />
          <p className="text-xl font-bold text-destructive">Synchronisation Error</p>
          <p className="text-muted-foreground">{(error as any).message}</p>
          <Button variant="outline" onClick={() => refresh()} className="mt-2">Try Again</Button>
        </Card>
      )}

      {!error && (
        <Card className="overflow-hidden border-border/40 bg-background/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <Loader2 className="h-16 w-16 animate-spin text-primary opacity-80" />
              <div className="space-y-1 text-center">
                <p className="text-2xl font-black text-foreground uppercase tracking-widest italic">Loading Orders</p>
                <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em] opacity-60">Scanning distributed database...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
              <div className="p-10 rounded-[3rem] bg-muted/10 border border-dashed border-border/60">
                <ShoppingCart className="h-24 w-24 opacity-10 text-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black text-foreground uppercase italic tracking-tighter">Zero results found</p>
                <p className="text-muted-foreground max-w-md mx-auto text-lg">No orders matching your criteria were discovered in the system.</p>
              </div>
              <Button variant="outline" onClick={() => { setSearch(""); setFilters({ ...filters, status: "", searchTerm: "" }); }} className="h-12 px-8 rounded-2xl">Reset All Filters</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead className="bg-muted/30">
                  <TR>
                    <TH className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">ID & Date</TH>
                    <TH className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Client Information</TH>
                    <TH className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Items</TH>
                    <TH className="py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Gross Total</TH>
                    <TH className="py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Order Status</TH>
                    <TH className="py-6 pr-10 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Operations</TH>
                  </TR>
                </THead>
                <TBody>
                  <AnimatePresence mode="popLayout">
                    {orders.map((order: OrderType) => {
                      const cfg = STATUS_CONFIG[order.status];
                      return (
                        <React.Fragment key={order.id}>
                          <TR className="group hover:bg-muted/10 transition-all border-b border-border/30">
                            <TD className="py-8 pl-10">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-black text-foreground uppercase tracking-widest font-mono">#{order.id.slice(0, 8)}</span>
                                <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                                  <CalendarDays className="h-3 w-3" />
                                  {new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            </TD>
                            <TD className="py-8">
                               <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm uppercase">
                                     {order.customerName.charAt(0)}
                                  </div>
                                  <span className="font-bold text-foreground text-lg tracking-tight capitalize">{order.customerName}</span>
                               </div>
                            </TD>
                            <TD className="py-8">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary/40 shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
                                <span className="font-black text-xs text-muted-foreground uppercase racking-widest">
                                  {order.orderItems.length} {order.orderItems.length === 1 ? "Item" : "Items"}
                                </span>
                              </div>
                            </TD>
                            <TD className="py-8 text-right px-4">
                              <span className="text-xl font-black text-foreground font-mono italic">
                                ${order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </TD>
                            <TD className="py-8 text-center">
                              <button 
                                onClick={() => setStatusModal({ id: order.id, status: order.status })}
                                className="group/btn relative"
                              >
                                <Badge 
                                  variant={cfg.variant as any} 
                                  className="h-9 px-5 rounded-xl font-black uppercase text-[10px] cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/20 border-border/10"
                                >
                                  {cfg.label}
                                  <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-60 group-hover:btn:opacity-100 transition-opacity" />
                                </Badge>
                              </button>
                            </TD>
                            <TD className="py-8 pr-10 text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => setViewOrder(order)}
                                  className="h-12 w-12 rounded-2xl bg-muted/5 hover:bg-primary/20 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                                >
                                  <Eye className="h-5 w-5" />
                                </Button>
                                {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-12 w-12 rounded-2xl bg-muted/5 hover:bg-destructive/20 hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
                                    onClick={() => showAlert({
                                      title: "Cancel Order?",
                                      message: "This will restore the product stock and mark the order as void.",
                                      confirmText: "Void Order",
                                      type: "danger",
                                      onConfirm: () => cancelOrder(order.id)
                                    })}
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                )}
                              </div>
                            </TD>
                          </TR>
                        </React.Fragment>
                      );
                    })}
                  </AnimatePresence>
                </TBody>
              </Table>

              {/* Pagination Controller */}
              {meta && meta.total > 0 && (
                <div className="flex flex-wrap items-center justify-between px-10 py-8 border-t border-border/30 bg-muted/5">
                  <div className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.2em] italic opacity-60">
                    Audit Log: Showing <span className="text-foreground">{((meta.page - 1) * meta.limit) + 1}</span> - <span className="text-foreground">{Math.min(meta.page * meta.limit, meta.total)}</span> / {meta.total} Records
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      disabled={meta.page <= 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                      className="rounded-2xl h-12 px-6 border-border/40 hover:bg-background h-12"
                    >
                      <ChevronLeft className="h-5 w-5 mr-2" />
                      Back
                    </Button>
                    
                    <div className="flex items-center gap-1.5 px-4 bg-muted/20 p-1.5 rounded-2xl border border-border/40">
                      {Array.from({ length: Math.ceil(meta.total / meta.limit) }).map((_, i) => {
                        const pageNum = i + 1;
                        if (pageNum === 1 || pageNum === Math.ceil(meta.total / meta.limit) || Math.abs(meta.page - pageNum) <= 1) {
                          return (
                            <Button
                              key={i}
                              variant={meta.page === pageNum ? "primary" : "ghost"}
                              size="icon"
                              className={`h-10 w-10 rounded-xl font-black ${meta.page === pageNum ? "shadow-lg shadow-primary/30" : "opacity-40"}`}
                              onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        return null;
                      }).filter(Boolean)}
                    </div>

                    <Button 
                      variant="outline" 
                      disabled={meta.page >= Math.ceil(meta.total / meta.limit)}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                      className="rounded-2xl h-12 px-6 border-border/40 hover:bg-background h-12"
                    >
                      Next
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* View Details Modal */}
      <Modal
        isOpen={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={viewOrder ? `Order #${viewOrder.id.slice(0, 8)}` : ""}
        description="Detailed transaction summary"
        maxWidth="xl"
      >
        {viewOrder && (
          <div className="space-y-8 py-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer Details</span>
                <h3 className="text-2xl font-black text-foreground capitalize italic tracking-tight">{viewOrder.customerName}</h3>
                <p className="text-sm text-muted-foreground ">{new Date(viewOrder.createdAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
              </div>
              <Badge variant={STATUS_CONFIG[viewOrder.status].variant as any} className="h-10 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest italic shadow-lg shadow-primary/10">
                {STATUS_CONFIG[viewOrder.status].label}
              </Badge>
            </div>

            <div className="bg-muted/20 rounded-3xl border border-border/40 overflow-hidden">
               <Table>
                  <THead className="bg-muted/30">
                    <TR>
                      <TH className="py-4 pl-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</TH>
                      <TH className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Qty</TH>
                      <TH className="py-4 text-right pr-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subtotal</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {viewOrder.orderItems.map((item, idx) => (
                      <TR key={idx} className="border-b border-border/20 last:border-0">
                        <TD className="py-5 pl-6 font-bold text-foreground capitalize">{item.product?.name || "Product"}</TD>
                        <TD className="py-5 text-center text-muted-foreground font-black text-sm">x{item.quantity}</TD>
                        <TD className="py-5 text-right pr-6 font-mono font-bold text-foreground italic">${(item.price * item.quantity).toFixed(2)}</TD>
                      </TR>
                    ))}
                  </TBody>
               </Table>
               
               <div className="bg-primary/5 p-6 border-t border-border/40 flex justify-between items-center">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] italic">Total Gross Amount</span>
                  <span className="text-3xl font-black text-primary italic font-mono tracking-tighter">${viewOrder.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" className="h-12 px-8 rounded-2xl" onClick={() => setViewOrder(null)}>Done</Button>
              {viewOrder.status !== "CANCELLED" && (
                <Button className="h-12 px-8 rounded-2xl bg-destructive hover:bg-destructive/90 text-white" onClick={() => {
                   setViewOrder(null);
                   showAlert({
                     title: "Void Order?",
                     message: "Are you sure you want to cancel this order? Stock will be restored.",
                     type: "danger",
                     onConfirm: () => cancelOrder(viewOrder.id)
                   });
                }}>Cancel Order</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Status Modal */}
      <Modal
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Update Dispatch Status"
        description="Advance the order through the fulfillment pipeline"
        maxWidth="sm"
      >
        <div className="grid grid-cols-1 gap-3 py-6">
          {STATUS_OPTIONS.filter(s => s !== "CANCELLED").map((opt) => (
            <Button
              key={opt}
              variant={statusModal?.status === opt ? "primary" : "outline"}
              className={`h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest ${
                statusModal?.status === opt ? "shadow-xl shadow-primary/20" : "hover:border-primary/40 hover:bg-primary/5"
              }`}
              onClick={async () => {
                if (statusModal) {
                  await updateStatus({ id: statusModal.id, status: opt });
                  setStatusModal(null);
                }
              }}
            >
              <Package className={`mr-3 h-5 w-5 ${statusModal?.status === opt ? "opacity-100" : "opacity-40"}`} />
              {opt}
            </Button>
          ))}
        </div>
      </Modal>

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Initialize New Order"
        description="Stock fulfillment and client assignment"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreate} className="space-y-8 py-4">
          <Input 
            label="Client Name" 
            required 
            placeholder="e.g. Victor Thorne" 
            value={formCustomer} 
            onChange={e => setFormCustomer(e.target.value)} 
            className="h-14 rounded-2xl bg-muted/20 border-border/40 focus:bg-background text-lg font-bold"
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Order Manifest</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setFormItems([...formItems, emptyItem()])} className="text-primary hover:bg-primary/5 rounded-xl font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {formItems.map((item, idx) => (
                <div key={item.tempId} className="flex gap-3 group">
                  <div className="flex-1">
                    <Select 
                      required 
                      value={item.productId} 
                      onChange={e => handleItemChange(idx, "productId", e.target.value)}
                      className="h-14 rounded-2xl bg-muted/10 border-border/40 focus:bg-background font-bold"
                    >
                      <option value="" disabled>Select Core Product</option>
                      {allProducts.map(p => (
                        <option key={p.id} value={p.id} disabled={p.status === "OUT_OF_STOCK"}>
                          {p.name} {p.status === "OUT_OF_STOCK" ? "(OUT OF STOCK)" : `($${p.price})`}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="w-32">
                    <Input 
                      type="number" 
                      min="1" 
                      required 
                      value={item.quantity} 
                      onChange={e => handleItemChange(idx, "quantity", parseInt(e.target.value, 10))}
                      className="h-14 rounded-2xl bg-muted/10 border-border/40 text-center font-black"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setFormItems(formItems.filter((_, i) => i !== idx))} 
                    disabled={formItems.length === 1}
                    className="h-14 w-14 rounded-2xl hover:bg-destructive/10 hover:text-destructive opacity-40 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/20 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest italic">Total Order Value</p>
                <p className="text-5xl font-black text-primary italic font-mono tracking-tighter">${calcTotal(formItems).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
             </div>
             <div className="flex gap-3 w-full md:w-auto">
               <Button type="button" variant="outline" className="flex-1 md:flex-none h-14 px-8 rounded-2xl" onClick={() => setShowCreate(false)}>Discard</Button>
               <Button type="submit" className="flex-1 md:flex-none h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 h-14" isLoading={isCreating}>Confirm Transaction</Button>
             </div>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
