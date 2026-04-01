"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import type { Toast, ToastType } from "@/lib/overlay-types";

const INDIGO = "oklch(0.68 0.24 262)";
const CYAN   = "oklch(0.78 0.18 205)";

const TYPE_MAP: Record<ToastType, { icon: any; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: "oklch(0.75 0.18 160)", bg: "oklch(0.75 0.18 160 / 0.12)" },
  error:   { icon: AlertCircle,  color: "oklch(0.65 0.22 22)",  bg: "oklch(0.65 0.22 22 / 0.12)" },
  info:    { icon: Info,         color: CYAN,                   bg: `${CYAN}18` },
  warning: { icon: AlertTriangle, color: "oklch(0.85 0.15 85)", bg: "oklch(0.85 0.15 85 / 0.12)" },
};

export function CustomToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = TYPE_MAP[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto min-w-[320px] max-w-md p-4 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl flex items-start gap-4 relative overflow-hidden"
              style={{ boxShadow: `0 10px 40px -10px oklch(0 0 0 / 0.3)` }}
            >
              {/* Type Indicator Bar */}
              <div 
                 className="absolute left-0 top-0 bottom-0 w-1.5" 
                 style={{ backgroundColor: config.color }} 
              />
              
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: config.bg, color: config.color }}
              >
                <config.icon className="w-6 h-6" />
              </div>

              <div className="flex-1 pt-0.5">
                <p className="text-base font-bold text-foreground leading-tight">{toast.message}</p>
                <p className="text-sm text-muted-foreground mt-1 uppercase font-bold tracking-widest opacity-60">{toast.type}</p>
              </div>

              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Progress Bar Animation */}
              <motion.div 
                className="absolute bottom-0 left-0 h-0.5"
                style={{ backgroundColor: config.color, opacity: 0.4 }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
