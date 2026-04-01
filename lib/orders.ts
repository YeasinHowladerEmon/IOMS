/* ─────────────────────────────────────────
   lib/orders.ts
   Types, API calls, and TanStack Query
   hooks for the Order Management module.
───────────────────────────────────────── */
"use client";

import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { api } from "./api";
import { useOverlay } from "./overlay-context";

/* ── Types ── */
export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  productId:   string;
  productName: string;
  quantity:    number;
  unitPrice:   number;
}

export interface Order {
  id:           string;
  customerName: string;
  items:        OrderItem[];
  totalPrice:   number;
  status:       OrderStatus;
  createdAt:    string;   // ISO date string
  updatedAt:    string;
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
  getAll:       ()                              => api.get<Order[]>("/orders"),
  getById:      (id: string)                    => api.get<Order>(`/orders/${id}`),
  create:       (payload: CreateOrderPayload)   => api.post<Order>("/orders", payload),
  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<Order>(`/orders/${id}/status`, { status }),
  cancel:       (id: string)                    =>
    api.patch<Order>(`/orders/${id}/status`, { status: "Cancelled" }),
  delete:       (id: string)                    => api.delete<void>(`/orders/${id}`),
};

/* ── Hooks: useOrders ── */
export const ordersOptions = queryOptions({
  queryKey: ["orders"],
  queryFn: ordersApi.getAll,
});

export function useOrdersQuery() {
  return useQuery(ordersOptions);
}

/* ── Hooks: Mutations ── */
export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showToast("Order created successfully", "success");
    },
    onError: (error: any) => {
      showAlert({
        title: "Order Creation Error",
        message: error.message || "Failed to create order. Please check your items and stock levels.",
        type: "danger"
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
    onSuccess: (updatedOrder, variables) => {
      queryClient.setQueryData(["orders"], (old: Order[] | undefined) => {
        if (!old) return old;
        return old.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      });
      showToast(`Order #${updatedOrder.id.slice(0, 8)} status: ${variables.status}`, "success");
    },
    onError: (error: any) => {
      showAlert({
        title: "Status Update Error",
        message: error.message || "Failed to update order status.",
        type: "danger"
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
      queryClient.setQueryData(["orders"], (old: Order[] | undefined) => {
        if (!old) return old;
        return old.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      });
      showToast(`Order #${updatedOrder.id.slice(0, 8)} cancelled`, "info");
    },
    onError: (error: any) => {
      showAlert({
        title: "Cancellation Error",
        message: error.message || "Failed to cancel order.",
        type: "danger"
      });
    }
  });
}

/* ── Utility ── */
export function calcTotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
}

export const STATUS_OPTIONS: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];
