"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import type { AlertOptions } from "@/lib/overlay-types";

const INDIGO = "oklch(0.68 0.24 262)";
const CYAN   = "oklch(0.78 0.18 205)";

const TYPE_MAP = {
  info:    { icon: Info,          color: CYAN,                   bg: `${CYAN}18` },
  danger:  { icon: AlertCircle,   color: "oklch(0.65 0.22 22)",  bg: "oklch(0.65 0.22 22 / 0.12)" },
  warning: { icon: AlertTriangle, color: "oklch(0.85 0.15 85)", bg: "oklch(0.85 0.15 85 / 0.12)" },
};

export function CustomAlertModal({ 
  options, 
  onConfirm, 
  onCancel 
}: { 
  options: AlertOptions, 
  onConfirm: () => void, 
  onCancel: () => void 
}) {
  const type = options.type || "info";
  const config = TYPE_MAP[type];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } }}
        className="w-full max-w-md bg-card/90 backdrop-blur-2xl border border-border/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Accent Glow */}
        <div 
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-20 pointer-events-none blur-[60px]" 
          style={{ backgroundColor: config.color }} 
        />

        <div className="flex flex-col items-center text-center">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl"
            style={{ backgroundColor: config.bg, color: config.color, border: `1px solid ${config.color}33` }}
          >
            <config.icon className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">{options.title}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            {options.message}
          </p>

          <div className="flex w-full gap-4">
            {options.cancelText && (
              <button
                onClick={onCancel}
                className="flex-1 py-4 px-6 rounded-2xl font-bold text-base bg-muted text-muted-foreground hover:bg-muted/80 transition-all border border-border"
              >
                {options.cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className="flex-1 py-4 px-6 rounded-2xl font-bold text-base text-white shadow-lg hover:opacity-90 transition-all"
              style={{ background: type === "danger" ? "oklch(0.65 0.22 22)" : `linear-gradient(135deg, ${INDIGO}, ${CYAN})` }}
            >
              {options.confirmText || "Confirm"}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
