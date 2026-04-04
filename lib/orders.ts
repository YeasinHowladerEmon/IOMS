/* ─────────────────────────────────────────
   lib/orders.ts
   Types, API calls, and TanStack Query
   hooks for the Order Management module.
───────────────────────────────────────── */
"use client";

import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { api } from "./api";
import { useOverlay } from "./overlay-context";
import { PaginatedResponse } from "./products";

/* ── Types ── */
export interface OrderFilters {
  searchTerm?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    price: number;
  };
}

export interface Order {
  id: string;
  userId: number;
  customerName: string;
  orderItems: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  customerName: string;
  items: {
    productId:   string;
    productName: string;
    quantity:    number;
    unitPrice:   number;
  }[];
}

/* ── API helpers ── */
export const ordersApi = {
  getAll: (filters: OrderFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    return api.get<PaginatedResponse<Order>>(`/orders${queryString ? `?${queryString}` : ""}`);
  },
  getById:      (id: string)                    => api.get<Order>(`/orders/${id}`),
  create:       (payload: CreateOrderPayload)   => api.post<Order>("/orders", payload),
  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<Order>(`/orders/${id}/status`, { status }),
  cancel:       (id: string)                    =>
    api.patch<Order>(`/orders/${id}/cancel`, {}),
  delete:       (id: string)                    => api.delete<void>(`/orders/${id}`),
};

/* ── Hooks: useOrders ── */
export function useOrdersQuery(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => ordersApi.getAll(filters),
  });
}

/* ── Hooks: Mutations ── */
export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["restock-queue"] });
      showToast("Order created successfully", "success");
    },
    onError: (error: any) => {
      const isStockError = error.message?.toLowerCase().includes("stock") || error.message?.toLowerCase().includes("inventory") || error.message?.toLowerCase().includes("quantity");
      showAlert({
        title: isStockError ? "Insufficient Stock" : "Order Error",
        message: isStockError 
          ? (error.message || "Some items in your order are no longer available in the requested quantity.")
          : (error.message || "We couldn't process this order. Please try again or contact support."),
        type: "danger",
        confirmText: "Review Order"
      });
    }
  });
}

export function useUpdateStatusMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showToast(`Order #${updatedOrder.id.slice(0, 8)} status updated`, "success");
    },
    onError: (error: any) => {
      const isTransitionError = error.message?.toLowerCase().includes("transition") || error.message?.toLowerCase().includes("cannot");
      showAlert({
        title: isTransitionError ? "Invalid Status Change" : "Update Failed",
        message: isTransitionError 
          ? "This order cannot be moved directly to the requested status. Please follow the standard workflow."
          : (error.message || "We encountered an error while updating the order status."),
        type: "danger",
        confirmText: "Close"
      });
    }
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: (id: string) => ordersApi.cancel(id),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["restock-queue"] });
      showToast(`Order #${updatedOrder.id.slice(0, 8)} cancelled`, "info");
    },
    onError: (error: any) => {
      const isLocked = error.message?.toLowerCase().includes("shipped") || error.message?.toLowerCase().includes("delivered");
      showAlert({
        title: isLocked ? "Order Locked" : "Cancellation Error",
        message: isLocked 
          ? "This order has already been processed and cannot be cancelled."
          : (error.message || "An error occurred while trying to cancel the order."),
        type: "danger",
        confirmText: "Go Back"
      });
    }
  });
}

/* ── Utility ── */
export function calcTotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
}

export const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
