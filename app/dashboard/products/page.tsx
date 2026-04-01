"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { 
  useProductsQuery, 
  useCreateProductMutation, 
  useUpdateProductMutation, 
  useDeleteProductMutation,
  type CreateProductPayload,
  type Product,
  type ProductFilters
} from "@/lib/products";
import { useCategoriesQuery } from "@/lib/categories";
import { useOverlay } from "@/lib/overlay-context";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Loader2, 
  AlertTriangle,
  Package,
  RefreshCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, THead, TBody, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: "",
    status: "",
    categoryId: "",
    page: 1,
    limit: 10
  });

  const { data: productsResponse, isLoading, error, refetch } = useProductsQuery(filters);
  const products = productsResponse?.data || [];
  const meta = productsResponse?.meta;

  const { data: categories = [] } = useCategoriesQuery();
  const { mutateAsync: createProduct, isPending: isCreating } = useCreateProductMutation();
  const { mutateAsync: updateProduct } = useUpdateProductMutation();
  const { mutateAsync: deleteProduct } = useDeleteProductMutation();
  const { showAlert } = useOverlay();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setFilters(prev => ({ ...prev, searchTerm: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState<CreateProductPayload>({
    name: "", 
    price: 0, 
    stockQuantity: 0, 
    minStockThreshold: 5, 
    status: "ACTIVE", 
    categoryId: ""
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ 
      name: "", 
      price: 0, 
      stockQuantity: 0, 
      minStockThreshold: 5, 
      status: "ACTIVE", 
      categoryId: categories[0]?.id || "" 
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ 
      name: p.name, 
      price: p.price, 
      stockQuantity: p.stockQuantity, 
      minStockThreshold: p.minStockThreshold, 
      status: p.status, 
      categoryId: p.categoryId 
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, payload: formData });
      } else {
        await createProduct(formData);
      }
      setShowAddModal(false);
    } catch (err) {
      // Error is handled by top-level toast/overlay
    }
  };

  return (
    <motion.div 
      className="space-y-7" 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {meta?.total || 0} products total · manage your catalog
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-5 h-5" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-muted/20 p-4 rounded-3xl border border-border/50">
        <div className="relative flex-1 min-w-[300px]">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Quick search by name…"
            className="pl-11 h-12 bg-background/50 border-border/40 focus:bg-background transition-all"
          />
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={filters.categoryId}
            onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value, page: 1 }))}
            className="w-[180px] h-12 bg-background/50"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any, page: 1 }))}
            className="w-[150px] h-12 bg-background/50"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </Select>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => {
              setSearch("");
              setFilters({ searchTerm: "", status: "", categoryId: "", page: 1, limit: 10 });
            }}
          >
            <RefreshCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5 text-destructive p-4">
          <div className="flex items-center gap-3 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            {(error as Error).message}
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="ml-auto underline">Retry</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Synchronizing Catalog…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="p-6 rounded-full bg-muted/10">
              <Package className="w-16 h-16 opacity-20" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black text-foreground uppercase italic tracking-tight">No Items Found</p>
              <p className="text-muted-foreground max-w-xs">Your search criteria didn't match any products in our database.</p>
            </div>
            <Button variant="outline" onClick={() => setSearch("")} className="mt-4">Clear All Filters</Button>
          </div>
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Product Details</TH>
                  <TH>Category</TH>
                  <TH className="text-right">Price</TH>
                  <TH className="text-center">Inventory</TH>
                  <TH></TH>
                </TR>
              </THead>
              <TBody>
                {products.map((p) => (
                  <TR key={p.id} className="group">
                    <TD>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{p.name}</span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">ID: {p.id.slice(0,8)}</span>
                      </div>
                    </TD>
                    <TD>
                      <Badge variant="outline" className="bg-muted/30">
                        {p.category?.name || "Uncategorized"}
                      </Badge>
                    </TD>
                    <TD className="text-right font-mono font-bold text-foreground">
                      ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TD>
                    <TD className="text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${
                            p.stockQuantity === 0 ? "bg-destructive animate-pulse" : 
                            p.stockQuantity <= p.minStockThreshold ? "bg-amber-500 animate-pulse" : 
                            "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                          }`} />
                          <span className="font-bold whitespace-nowrap">
                            {p.stockQuantity} items
                          </span>
                        </div>
                        <Badge 
                          variant={
                            p.status === "OUT_OF_STOCK" ? "danger" :
                            p.stockQuantity <= p.minStockThreshold ? "warning" : "success"
                          }
                          className="text-[10px] font-black tracking-tighter"
                        >
                          {p.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </TD>
                    <TD className="text-right">
                       <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 transition-colors" onClick={() => handleOpenEdit(p)}>
                            <Edit3 className="w-5 h-5" />
                          </Button>
                          <Button 
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={() => showAlert({
                              title: "Delete Product?",
                              message: `Are you sure you want to remove "${p.name}"? This action cannot be undone.`,
                              confirmText: "Delete",
                              cancelText: "Keep Product",
                              type: "danger",
                              onConfirm: () => deleteProduct(p.id)
                            })} 
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                       </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            {/* Pagination Controls */}
            {meta && meta.total > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/5">
                <div className="text-[12px] font-medium text-muted-foreground uppercase tracking-widest">
                  Showing <span className="font-bold text-foreground">{((meta.page - 1) * meta.limit) + 1}</span> to <span className="font-bold text-foreground">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-bold text-foreground">{meta.total}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={meta.page <= 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                    className="rounded-xl h-10 px-4"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Prev
                  </Button>
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.ceil(meta.total / meta.limit) }).map((_, i) => {
                      const pageNum = i + 1;
                      // Logic to show limited page numbers
                      if (
                        pageNum === 1 || 
                        pageNum === Math.ceil(meta.total / meta.limit) || 
                        Math.abs(meta.page - pageNum) <= 1
                      ) {
                        return (
                          <Button
                            key={i}
                            variant={meta.page === pageNum ? "primary" : "ghost"}
                            size="icon"
                            className={`h-10 w-10 rounded-xl font-bold ${meta.page === pageNum ? "shadow-lg shadow-primary/20" : ""}`}
                            onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      if (pageNum === 2 || pageNum === Math.ceil(meta.total / meta.limit) - 1) {
                        return <span key={i} className="px-1 text-muted-foreground font-bold">...</span>;
                      }
                      return null;
                    }).filter(Boolean).filter((item, index, self) => {
                       // Remove consecutive dots
                       if (typeof item === 'string' && typeof self[index - 1] === 'string') return false;
                       return true;
                    })}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={meta.page >= Math.ceil(meta.total / meta.limit)}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                    className="rounded-xl h-10 px-4"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingProduct ? "Edit Product" : "New Product"}
        description="Catalog item details"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input 
                label="Product Name" 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <Select 
              label="Category" 
              required 
              value={formData.categoryId} 
              onChange={e => setFormData({...formData, categoryId: e.target.value})}
            >
              <option value="" disabled>Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input 
              label="Price ($)" 
              required 
              value={formData.price} 
              onChange={e => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                const parts = val.split(".");
                const cleanVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : val;
                setFormData({...formData, price: cleanVal === "" ? 0 : Number(cleanVal)});
              }} 
            />
            <Input 
              label="Stock Quantity" 
              required 
              value={formData.stockQuantity} 
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                const num = val === "" ? 0 : parseInt(val, 10);
                setFormData({
                  ...formData, 
                  stockQuantity: num,
                  status: num > 0 ? "ACTIVE" : "OUT_OF_STOCK"
                });
              }} 
            />
            <Input 
              label="Low Stock Alert (Min Threshold)" 
              required 
              value={formData.minStockThreshold} 
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setFormData({...formData, minStockThreshold: val === "" ? 0 : parseInt(val, 10)});
              }} 
            />
            <Select 
              label="Product Status" 
              required 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value as "ACTIVE" | "OUT_OF_STOCK"})}
            >
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full mt-4 h-12 rounded-2xl"
            isLoading={isCreating}
          >
            {editingProduct ? "Save Changes" : "Create Product"}
          </Button>
        </form>
      </Modal>
    </motion.div>
  );
}
