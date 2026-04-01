/* ─────────────────────────────────────────
   lib/activities.ts
───────────────────────────────────────── */
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export interface ActivityLog {
  id: string;
  message: string;
  createdAt: string;
}

export const activitiesApi = {
  getLogs: (limit: number = 50) => api.get<ActivityLog[]>(`/activity-logs?limit=${limit}`),
};

export function useActivityLogsQuery(limit: number = 50) {
  return useQuery({
    queryKey: ["activity-logs", limit],
    queryFn: () => activitiesApi.getLogs(limit),
  });
}
