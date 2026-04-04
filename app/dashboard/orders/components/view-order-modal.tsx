import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Order as OrderType } from "@/lib/orders";
import { STATUS_CONFIG } from "./status-config";

interface ViewOrderModalProps {
  viewOrder: OrderType | null;
  onClose: () => void;
  onCancelOrder: (id: string) => void;
}

export function ViewOrderModal({ viewOrder, onClose, onCancelOrder }: ViewOrderModalProps) {
  return (
    <Modal isOpen={!!viewOrder} onClose={onClose} title={viewOrder ? `Order #${viewOrder.id.slice(0, 8).toUpperCase()}` : ""} description="Detailed transaction summary" maxWidth="xl">
      {viewOrder && (
        <div className="space-y-6 py-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Customer</p>
              <h3 className="text-xl font-black capitalize mt-0.5">{viewOrder.customerName}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(viewOrder.createdAt).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
              </p>
            </div>
            <Badge variant={STATUS_CONFIG[viewOrder.status].variant} className="gap-1.5 text-xs px-3 py-1.5">
              <span className={STATUS_CONFIG[viewOrder.status].color}>{STATUS_CONFIG[viewOrder.status].icon}</span>
              {STATUS_CONFIG[viewOrder.status].label}
            </Badge>
          </div>

          <div className="rounded-xl border border-border/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/20">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Qty</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {viewOrder.orderItems.map((item, i) => (
                  <tr key={i} className="border-t border-border/20">
                    <td className="px-5 py-3 font-semibold capitalize">{item.product?.name || "Product"}</td>
                    <td className="px-5 py-3 text-center text-muted-foreground">×{item.quantity}</td>
                    <td className="px-5 py-3 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border/40 bg-muted/10">
                  <td colSpan={2} className="px-5 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</td>
                  <td className="px-5 py-4 text-right text-xl font-black text-primary">${viewOrder.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="h-10 px-6 rounded-xl">Close</Button>
            {viewOrder.status !== "CANCELLED" && (
              <Button variant="danger" onClick={() => onCancelOrder(viewOrder.id)} className="h-10 px-6 rounded-xl">
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
