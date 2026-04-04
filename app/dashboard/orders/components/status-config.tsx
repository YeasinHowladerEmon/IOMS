import React from "react";
import { OrderStatus } from "@/lib/orders";
import { Clock, Package2, TrendingUp, CheckCircle2, XCircle } from "lucide-react";

/* ── Status config ── */
export const STATUS_CONFIG: Record<OrderStatus, { variant: any; label: string; icon: React.ReactNode; color: string }> = {
  PENDING:   { variant: "warning",  label: "Pending",   icon: <Clock className="h-3 w-3" />,        color: "text-amber-400" },
  CONFIRMED: { variant: "info",     label: "Confirmed", icon: <Package2 className="h-3 w-3" />,     color: "text-sky-400" },
  SHIPPED:   { variant: "info",     label: "Shipped",   icon: <TrendingUp className="h-3 w-3" />,   color: "text-indigo-400" },
  DELIVERED: { variant: "success",  label: "Delivered", icon: <CheckCircle2 className="h-3 w-3" />, color: "text-emerald-400" },
  CANCELLED: { variant: "danger",   label: "Cancelled", icon: <XCircle className="h-3 w-3" />,      color: "text-red-400" },
};
