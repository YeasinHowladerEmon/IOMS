/* ─────────────────────────────────────────
   lib/dashboard.ts
───────────────────────────────────────── */
"use client";

import { useQuery, queryOptions } from "@tanstack/react-query";
import { api } from "./api";

export interface DashboardStats {
  insights: {
    totalOrdersToday: number;
    pendingOrders: number;
    completedOrders: number;
    lowStockItemsCount: number;
    revenueToday: number;
  };
  revenueAnalytics: { date: string; revenue: number; orderCount: number }[];
  recentActivities: {
    id: string;
    message: string;
    createdAt: string;
  }[];
  productSummary: {
    name: string;
    stockQuantity: number;
    status: string;
  }[];
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>("/dashboard"),
};

export const dashboardStatsOptions = queryOptions({
  queryKey: ["dashboard-stats"],
  queryFn: dashboardApi.getStats,
  refetchInterval: 30000, 
});

export function useDashboardStatsQuery() {
  return useQuery(dashboardStatsOptions);
}
