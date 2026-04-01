"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming a utility exists or I'll create one

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const INDIGO = "oklch(0.68 0.24 262)";
const CYAN   = "oklch(0.78 0.18 205)";

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${INDIGO}, ${CYAN})`,
      color: "white",
      boxShadow: "0 4px 15px oklch(0 0 0 / 0.1)",
    },
    secondary: {
      background: "oklch(0.22 0.022 252)",
      color: "white",
      border: "1px solid oklch(0.32 0.022 252)",
    },
    danger: {
      background: "oklch(0.55 0.22 22)",
      color: "white",
    },
    ghost: {
      background: "transparent",
      color: "inherit",
    },
    outline: {
      background: "transparent",
      color: "inherit",
      border: "1px solid oklch(0.22 0.022 252)",
    }
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-xl",
    md: "px-5 py-2.5 text-base font-bold rounded-2xl",
    lg: "px-7 py-3.5 text-lg font-bold rounded-3xl",
    icon: "p-2.5 rounded-xl",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        className
      )}
      style={variants[variant]}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children as React.ReactNode}
    </motion.button>
  );
}
