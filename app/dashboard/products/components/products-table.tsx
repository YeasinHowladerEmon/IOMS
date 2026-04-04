import React from "react";
import { Loader2, Package, Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useOverlay } from "@/lib/overlay-context";
import { useDeleteProductMutation, type Product, type ProductFilters } from "@/lib/products";

interface ProductsTableProps {
  isLoading: boolean;
  products: Product[];
  meta: any;
  filters: ProductFilters;
  setFilters: React.Dispatch<React.SetStateAction<ProductFilters>>;
  setSearch: (val: string) => void;
  onEditProduct: (p: Product) => void;
}

export function ProductsTable({
  isLoading,
  products,
  meta,
  filters,
  setFilters,
  setSearch,
  onEditProduct
}: ProductsTableProps) {
  const { showAlert } = useOverlay();
  const { mutateAsync: deleteProduct } = useDeleteProductMutation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Synchronizing Catalog…</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
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
    );
  }

  return (
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
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 transition-colors" onClick={() => onEditProduct(p)}>
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
                        onConfirm: () => { deleteProduct(p.id); }
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
  );
}
