/* ─────────────────────────────────────────
   lib/restock.ts
───────────────────────────────────────── */
"use client";

import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { api } from "./api";
import { useOverlay } from "./overlay-context";

export interface RestockItem {
  id: string;
  productId: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status?: "Pending" | "Ordered" | "Completed";
  product: {
    name: string;
    stockQuantity: number;
    minStockThreshold: number;
  };
  createdAt: string;
}

export const restockApi = {
  getAll: () => api.get<RestockItem[]>("/restock-queue"),
  restockProduct: (productId: string, stockToAdd: number) => 
    api.patch<void>(`/restock-queue/${productId}/restock`, { stockToAdd }),
  delete: (productId: string) => api.delete<void>(`/restock-queue/${productId}`),
};

export const restockQueueOptions = queryOptions({
  queryKey: ["restock-queue"],
  queryFn: restockApi.getAll,
});

export function useRestockQueueQuery() {
  return useQuery(restockQueueOptions);
}

export function useRestockMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: ({ productId, stockToAdd }: { productId: string; stockToAdd: number }) => 
      restockApi.restockProduct(productId, stockToAdd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock-queue"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast(`Product restocked successfully`, "success");
    },
    onError: (error: any) => {
      showAlert({
        title: "Restock Failed",
        message: error.message || "We encountered an error while restocking the product.",
        type: "danger",
        confirmText: "Close"
      });
    }
  });
}

export function useDeleteFromQueueMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: (productId: string) => restockApi.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock-queue"] });
      showToast("Item removed from queue", "info");
    },
    onError: (error: any) => {
      showAlert({
        title: "Action Failed",
        message: error.message || "Could not remove product from queue.",
        type: "danger"
      });
    }
  });
}
