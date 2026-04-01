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
  productName: string;
  currentStock: number;
  lowStockThreshold: number;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Ordered" | "Completed";
  createdAt: string;
}

export const restockApi = {
  getAll: () => api.get<RestockItem[]>("/restock-queue"),
  updateStatus: (id: string, status: "Ordered" | "Completed") => 
    api.patch<RestockItem>(`/restock-queue/${id}`, { status }),
  delete: (id: string) => api.delete<void>(`/restock-queue/${id}`),
};

export const restockQueueOptions = queryOptions({
  queryKey: ["restock-queue"],
  queryFn: restockApi.getAll,
});

export function useRestockQueueQuery() {
  return useQuery(restockQueueOptions);
}

export function useUpdateRestockStatusMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Ordered" | "Completed" }) => 
      restockApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restock-queue"] });
      showToast(`Restock status updated to ${variables.status}`, "success");
    },
    onError: (error: any) => {
      showAlert({
        title: "Restock Update Error",
        message: error.message || "Failed to update restock status.",
        type: "danger"
      });
    }
  });
}
