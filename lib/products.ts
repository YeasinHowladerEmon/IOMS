/* ─────────────────────────────────────────
   lib/products.ts
───────────────────────────────────────── */
"use client";

import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { api } from "./api";
import { useOverlay } from "./overlay-context";

export interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  minStockThreshold: number;
  status: "ACTIVE" | "OUT_OF_STOCK";
  categoryId: string;
  category?: { name: string };
  createdAt: string;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  stockQuantity: number;
  minStockThreshold: number;
  status: "ACTIVE" | "OUT_OF_STOCK";
  categoryId: string;
}

export interface PaginatedResponse<T> {
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: T[];
}

export interface ProductFilters {
  searchTerm?: string;
  categoryId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  getAll: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    return api.get<PaginatedResponse<Product>>(`/products${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (payload: CreateProductPayload) => api.post<Product>("/products", payload),
  update: (id: string, payload: Partial<CreateProductPayload>) => api.patch<Product>(`/products/${id}`, payload),
  delete: (id: string) => api.delete<void>(`/products/${id}`),
};

export function useProductsQuery(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsApi.getAll(filters),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("Product created successfully", "success");
    },
    onError: (error: any) => {
      const isDuplicate = error.message?.toLowerCase().includes("already exists") || error.message?.toLowerCase().includes("sku");
      showAlert({
        title: isDuplicate ? "SKU Conflict" : "Catalog Error",
        message: isDuplicate 
          ? "A product with this SKU or Name already exists in your catalog."
          : (error.message || "We couldn't create this product. Please check your inputs."),
        type: "danger",
        confirmText: "Check Data"
      });
    }
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProductPayload> }) => 
      productsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("Product updated", "success");
    },
    onError: (error: any) => {
      showAlert({
        title: "Update Error",
        message: error.message || "Failed to update product.",
        type: "danger"
      });
    }
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("Product deleted", "success");
    },
    onError: (error: any) => {
      const isLinked = error.message?.toLowerCase().includes("order") || error.message?.toLowerCase().includes("relation");
      showAlert({
        title: isLinked ? "Product In Use" : "Deletion Error",
        message: isLinked 
          ? "This product is linked to existing orders and cannot be deleted. Try archiving it instead."
          : (error.message || "We encountered an error while trying to remove this product."),
        type: "danger",
        confirmText: "I Understand"
      });
    }
  });
}
