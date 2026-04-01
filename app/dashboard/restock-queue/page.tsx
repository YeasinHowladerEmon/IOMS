"use client";

import { 
  useRestockQueueQuery, 
  useRestockMutation,
  useDeleteFromQueueMutation,
} from "@/lib/restock";
import { motion } from "framer-motion";
import { 
  Loader2, 
  RefreshCcw,
  AlertTriangle,
  Package,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


export default function RestockQueuePage() {
  const { data: items = [], isLoading, error, refetch } = useRestockQueueQuery();
  const { mutateAsync: restock, isPending: isUpdating } = useRestockMutation();
  const { mutateAsync: dismiss } = useDeleteFromQueueMutation();

  return (
    <motion.div 
      className="space-y-8" 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Restock Queue</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Automated low-stock monitoring and ordering
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => refetch()}
          isLoading={isLoading}
        >
          <RefreshCcw className="w-5 h-5" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted/20 border-border/40" />
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full py-32 text-center flex flex-col items-center gap-4 bg-card/20 rounded-[2.5rem] border border-dashed border-border/60">
            <Package className="w-16 h-16 opacity-10" />
            <p className="text-xl font-bold text-foreground">All stock levels are optimal</p>
            <p className="text-muted-foreground">No items currently require restock.</p>
          </div>
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              className="p-6 relative overflow-hidden group hover:border-primary/40 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground line-clamp-1">{item.product.name}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">Stock: {item.product.stockQuantity}</Badge>
                    <Badge variant="danger" className="bg-destructive/10 border-destructive/20 text-destructive">
                      Min: {item.product.minStockThreshold}
                    </Badge>
                  </div>
                </div>
                <div className="shrink-0">
                  <Badge variant={item.priority === "HIGH" ? "danger" : item.priority === "MEDIUM" ? "warning" : "success"} className="p-2.5 rounded-xl">
                    <Package className="w-4 h-4" />
                  </Badge>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Priority</span>
                  <span className={`text-base font-bold ${
                    item.priority === "HIGH" ? "text-destructive" : 
                    item.priority === "MEDIUM" ? "text-warning" : 
                    "text-emerald-500"
                  }`}>
                    {item.priority}
                  </span>
                </div>

                <div className="flex gap-2">
                    <Button 
                      size="sm"
                      isLoading={isUpdating}
                      onClick={() => restock({ productId: item.productId, stockToAdd: item.product.minStockThreshold })}
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Restock (+{item.product.minStockThreshold})
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
                      onClick={() => dismiss(item.productId)}
                    >
                      Dismiss
                    </Button>
                </div>
              </div>

              {/* Priority indicator line */}
              <div 
                className={`absolute bottom-0 left-0 right-0 h-1 transition-all ${
                  item.priority === "HIGH" ? "bg-destructive shadow-[0_0_15px_oklch(0.65_0.22_22)]" : "bg-muted/40"
                }`} 
              />
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}
