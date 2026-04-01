"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { CustomToastContainer } from "@/components/ui/custom-toast";
import { CustomAlertModal } from "@/components/ui/custom-alert";
import { Toast, ToastType, AlertOptions } from "@/lib/overlay-types";

interface OverlayContextType {
  showToast: (message: string, type?: ToastType) => void;
  showAlert: (options: AlertOptions) => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlert(options);
  }, []);

  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (alert?.onConfirm) alert.onConfirm();
    closeAlert();
  }, [alert, closeAlert]);

  const handleCancel = useCallback(() => {
    if (alert?.onCancel) alert.onCancel();
    closeAlert();
  }, [alert, closeAlert]);

  return (
    <OverlayContext.Provider value={{ showToast, showAlert }}>
      {children}
      
      {/* Global Toast Container */}
      <CustomToastContainer toasts={toasts} removeToast={(id: string) => setToasts(prev => prev.filter(t => t.id !== id))} />
      
      {/* Global Alert Modal */}
      <AnimatePresence>
        {alert && (
          <CustomAlertModal 
            options={alert} 
            onConfirm={handleConfirm} 
            onCancel={handleCancel} 
          />
        )}
      </AnimatePresence>
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (!context) {
    // Fallback for SSR or build-time rendering
    return {
      showToast: () => {},
      showAlert: () => {},
    };
  }
  return context;
}
