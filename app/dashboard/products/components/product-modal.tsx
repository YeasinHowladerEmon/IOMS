import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  useCreateProductMutation, 
  useUpdateProductMutation, 
  type CreateProductPayload,
  type Product
} from "@/lib/products";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categories: { id: string; name: string }[];
}

const defaultFormData = (categoryId: string): CreateProductPayload => ({
  name: "", 
  price: 0, 
  stockQuantity: 0, 
  minStockThreshold: 5, 
  status: "ACTIVE", 
  categoryId
});

export function ProductModal({ isOpen, onClose, editingProduct, categories }: ProductModalProps) {
  const [formData, setFormData] = useState<CreateProductPayload>(defaultFormData(""));
  const { mutateAsync: createProduct, isPending: isCreating } = useCreateProductMutation();
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProductMutation();

  useEffect(() => {
    if (editingProduct) {
      setFormData({ 
        name: editingProduct.name, 
        price: editingProduct.price, 
        stockQuantity: editingProduct.stockQuantity, 
        minStockThreshold: editingProduct.minStockThreshold, 
        status: editingProduct.status, 
        categoryId: editingProduct.categoryId 
      });
    } else {
      setFormData(defaultFormData(categories[0]?.id || ""));
    }
  }, [editingProduct, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, payload: formData });
      } else {
        await createProduct(formData);
      }
      onClose();
    } catch (err) {
      // Error is handled by top-level toast/overlay defined inside the mutation
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? "Edit Product" : "New Product"}
      description="Catalog item details"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
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
          isLoading={isPending}
        >
          {editingProduct ? "Save Changes" : "Create Product"}
        </Button>
      </form>
    </Modal>
  );
}
