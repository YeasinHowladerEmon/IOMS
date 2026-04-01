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
  sku: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  category?: { name: string };
  createdAt: string;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
}

export const productsApi = {
  getAll: () => api.get<Product[]>("/products"),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (payload: CreateProductPayload) => api.post<Product>("/products", payload),
  update: (id: string, payload: Partial<CreateProductPayload>) => api.patch<Product>(`/products/${id}`, payload),
  delete: (id: string) => api.delete<void>(`/products/${id}`),
};

export const productsOptions = queryOptions({
  queryKey: ["products"],
  queryFn: productsApi.getAll,
});

export function useProductsQuery() {
  return useQuery(productsOptions);
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
      showAlert({
        title: "Product Error",
        message: error.message || "Failed to create product. Please check your data.",
        type: "danger"
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
      showAlert({
        title: "Deletion Error",
        message: error.message || "Failed to delete product.",
        type: "danger"
      });
    }
  });
}
