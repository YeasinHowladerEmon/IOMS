/* ─────────────────────────────────────────
   lib/activity.ts
───────────────────────────────────────── */
"use client";

import { useQuery, queryOptions } from "@tanstack/react-query";
import { api } from "./api";

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details?: string;
  createdAt: string;
}

export const activityApi = {
  getAll: () => api.get<ActivityLog[]>("/activity-logs"),
};

export const activityLogsOptions = queryOptions({
  queryKey: ["activity-logs"],
  queryFn: activityApi.getAll,
});

export function useActivityLogsQuery() {
  return useQuery(activityLogsOptions);
}
