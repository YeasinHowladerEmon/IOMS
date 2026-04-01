/* ─────────────────────────────────────────
   lib/dashboard.ts
───────────────────────────────────────── */
"use client";

import { useQuery, queryOptions } from "@tanstack/react-query";
import { api } from "./api";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  stockChange: number;
  customersChange: number;
  recentActivity: any[];
  topProducts: any[];
  revenueByDay: { day: string; revenue: number }[];
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
