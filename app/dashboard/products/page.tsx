"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { 
  useProductsQuery, 
  type Product,
  type ProductFilters
} from "@/lib/products";
import { useCategoriesQuery } from "@/lib/categories";
import { useRefresh } from "@/hooks/use-refresh";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

import { ProductsTable } from "./components/products-table";
import { ProductModal } from "./components/product-modal";

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
  const { handleRefresh } = useRefresh(refetch);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setFilters(prev => ({ ...prev, searchTerm: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setShowAddModal(true);
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
            <Button variant="ghost" size="sm" onClick={handleRefresh} className="ml-auto underline">Retry</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm">
        <ProductsTable
          isLoading={isLoading}
          products={products}
          meta={meta}
          filters={filters}
          setFilters={setFilters}
          setSearch={setSearch}
          onEditProduct={handleOpenEdit}
        />
      </Card>

      <ProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        editingProduct={editingProduct}
        categories={categories}
      />
    </motion.div>
  );
}
