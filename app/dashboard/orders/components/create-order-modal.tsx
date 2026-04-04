import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOverlay } from "@/lib/overlay-context";
import { useCreateOrderMutation, type CreateOrderPayload } from "@/lib/orders";
import { type Product } from "@/lib/products";

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

export function calcTotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
}

export function CreateOrderModal({ isOpen, onClose, allProducts }: CreateOrderModalProps) {
  const [formCustomer, setFormCustomer] = useState("");
  const [formItems, setFormItems] = useState<UIOrderItem[]>([emptyItem()]);
  const { showAlert } = useOverlay();
  const { mutateAsync: createOrder, isPending: isCreating } = useCreateOrderMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validItems = formItems.filter(i => i.productId !== "").map(({ tempId, ...rest }) => rest);
      if (validItems.length === 0) { 
        showAlert({ title: "Empty Order", message: "Add at least one product.", type: "warning" }); 
        return; 
      }
      const ids = validItems.map(i => i.productId);
      if (new Set(ids).size !== ids.length) { 
        showAlert({ title: "Duplicate Products", message: "This product is already added. Adjust quantity instead.", type: "warning" }); 
        return; 
      }
      for (const item of validItems) {
        const prod = allProducts.find(p => p.id === item.productId);
        if (prod?.status !== "ACTIVE") { 
          showAlert({ title: "Unavailable", message: `${prod?.name} is unavailable.`, type: "danger" }); 
          return; 
        }
        if (prod && prod.stockQuantity < item.quantity) { 
          showAlert({ title: "Out of Stock", message: `${prod.name} has only ${prod.stockQuantity} units.`, type: "danger" }); 
          return; 
        }
      }
      await createOrder({ customerName: formCustomer, items: validItems } as CreateOrderPayload);
      onClose();
      // Reset form
      setFormCustomer("");
      setFormItems([emptyItem()]);
    } catch (e) {
      // Handled by the mutation
    }
  };

  const handleItemChange = (idx: number, field: keyof UIOrderItem, value: any) => {
    const next = [...formItems];
    next[idx] = { ...next[idx], [field]: value };
    if (field === "productId" && value) {
      const prod = allProducts.find(p => p.id === value);
      if (prod) { next[idx].unitPrice = prod.price; next[idx].productName = prod.name; }
    }
    setFormItems(next);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Order" description="Assign products and customer details" maxWidth="2xl">
      <form onSubmit={handleCreate} className="space-y-6 py-2">
        <Input
          label="Customer Name"
          required
          placeholder="e.g. John Doe"
          value={formCustomer}
          onChange={e => setFormCustomer(e.target.value)}
          className="h-11 rounded-xl"
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Order Items</p>
            <Button type="button" variant="ghost" size="sm" onClick={() => setFormItems([...formItems, emptyItem()])} className="h-8 px-3 rounded-lg text-primary">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
            </Button>
          </div>

          {formItems.map((item, idx) => (
            <div key={item.tempId} className="flex gap-2">
              <div className="flex-1">
                <Select value={item.productId} required onChange={e => handleItemChange(idx, "productId", e.target.value)} className="h-11 rounded-xl">
                  <option value="" disabled>Select product</option>
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id} disabled={p.status === "OUT_OF_STOCK"}>
                      {p.name} {p.status === "OUT_OF_STOCK" ? "(Out of stock)" : `— $${p.price}`}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-24">
                <Input
                  type="number" min="1" required
                  value={item.quantity}
                  onChange={e => handleItemChange(idx, "quantity", parseInt(e.target.value, 10))}
                  className="h-11 rounded-xl text-center font-bold"
                />
              </div>
              <button
                type="button"
                onClick={() => setFormItems(formItems.filter((_, i) => i !== idx))}
                disabled={formItems.length === 1}
                className="h-11 w-11 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-5 rounded-2xl bg-primary/5 border border-primary/20">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-3xl font-black text-primary mt-0.5">${calcTotal(formItems).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-10 px-5 rounded-xl">Cancel</Button>
            <Button type="submit" isLoading={isCreating} className="h-10 px-6 rounded-xl">Place Order</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
