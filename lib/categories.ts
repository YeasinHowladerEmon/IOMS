/* ─────────────────────────────────────────
   lib/categories.ts
───────────────────────────────────────── */
"use client";

import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { api } from "./api";
import { useOverlay } from "./overlay-context";

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export const categoriesApi = {
  getAll: () => api.get<Category[]>("/categories"),
  create: (payload: CreateCategoryPayload) => api.post<Category>("/categories", payload),
  delete: (id: string) => api.delete<void>(`/categories/${id}`),
};

export const categoriesOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: categoriesApi.getAll,
});

export function useCategoriesQuery() {
  return useQuery(categoriesOptions);
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showToast("Category created successfully", "success");
    },
    onError: (error: any) => {
      const isDuplicate = error.message?.toLowerCase().includes("already exists");
      showAlert({
        title: isDuplicate ? "Duplicate Category" : "Creation Failed",
        message: isDuplicate 
          ? `The category name you entered is already in use. Please try a different name.`
          : (error.message || "Could not create your category at this time."),
        type: "danger",
        confirmText: "Try Again"
      });
    }
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showToast("Category deleted", "success");
    },
    onError: (error: any) => {
      showAlert({
        title: "Deletion Error",
        message: error.message || "Failed to delete category. Ensure no products are linked to it.",
        type: "danger"
      });
    }
  });
}
