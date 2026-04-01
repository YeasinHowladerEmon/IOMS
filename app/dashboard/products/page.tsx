"use client";

import { useState } from "react";
import { 
  useProductsQuery, 
  useCreateProductMutation, 
  useUpdateProductMutation, 
  useDeleteProductMutation,
  type CreateProductPayload,
  type Product
} from "@/lib/products";
import { useCategoriesQuery } from "@/lib/categories";
import { useOverlay } from "@/lib/overlay-context";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Loader2, 
  AlertTriangle,
  Package,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, THead, TBody, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const { data: products = [], isLoading, error, refetch } = useProductsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { mutateAsync: createProduct, isPending: isCreating } = useCreateProductMutation();
  const { mutateAsync: updateProduct } = useUpdateProductMutation();
  const { mutateAsync: deleteProduct } = useDeleteProductMutation();
  const { showAlert } = useOverlay();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState<CreateProductPayload>({
    name: "", sku: "", description: "", price: 0, stock: 0, categoryId: ""
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ name: "", sku: "", description: "", price: 0, stock: 0, categoryId: categories[0]?.id || "" });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ 
      name: p.name, 
      sku: p.sku, 
      description: p.description || "", 
      price: p.price, 
      stock: p.stock, 
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
      console.error(err);
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

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
            {products.length} products total · manage your catalog
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-5 h-5" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            className="pl-11"
          />
          <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
        </div>
        <Button variant="outline">
          <Filter className="w-4.5 h-4.5" />
          Filter
        </Button>
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

      <Card>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground font-medium">Loading products catalog…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Package className="w-16 h-16 opacity-10" />
            <p className="text-xl font-bold text-foreground">No products found</p>
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Product</TH>
                <TH>SKU</TH>
                <TH>Category</TH>
                <TH className="text-right">Price</TH>
                <TH className="text-center">Stock</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((p) => (
                <TR key={p.id}>
                  <TD className="font-bold text-foreground">{p.name}</TD>
                  <TD className="font-mono text-sm text-muted-foreground">{p.sku}</TD>
                  <TD>
                    <Badge variant="info">
                      {p.category?.name || "Uncategorized"}
                    </Badge>
                  </TD>
                  <TD className="text-right font-bold text-foreground">${p.price.toFixed(2)}</TD>
                  <TD className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-base font-bold ${p.stock <= 5 ? "text-destructive" : "text-foreground"}`}>
                        {p.stock}
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                         <div className={`h-full ${p.stock <= 5 ? "bg-destructive" : "bg-emerald-500"}`} style={{ width: `${Math.min(p.stock * 2, 100)}%` }} />
                      </div>
                    </div>
                  </TD>
                  <TD className="text-right whitespace-nowrap">
                     <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(p)}>
                          <Edit3 className="w-5 h-5" />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => showAlert({
                            title: "Delete Product?",
                            message: `Are you sure you want to remove "${p.name}"? This action cannot be undone.`,
                            confirmText: "Delete",
                            cancelText: "Keep Product",
                            type: "danger",
                            onConfirm: () => deleteProduct(p.id)
                          })} 
                          className="hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                     </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
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
            <Input 
              label="SKU" 
              required 
              value={formData.sku} 
              onChange={e => setFormData({...formData, sku: e.target.value})} 
            />
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
              type="number" 
              step="0.01" 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
            />
            <Input 
              label="Stock" 
              required 
              type="number" 
              value={formData.stock} 
              onChange={e => setFormData({...formData, stock: Number(e.target.value)})} 
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            isLoading={isCreating}
          >
            {editingProduct ? "Save Changes" : "Create Product"}
          </Button>
        </form>
      </Modal>
    </motion.div>
  );
}
