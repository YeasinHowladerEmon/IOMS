import React from "react";
import { Modal } from "@/components/ui/modal";
import { STATUS_OPTIONS, type OrderStatus } from "@/lib/orders";
import { STATUS_CONFIG } from "./status-config";

interface StatusModalProps {
  statusModal: { id: string; status: OrderStatus } | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
}

export function StatusModal({ statusModal, onClose, onUpdateStatus }: StatusModalProps) {
  return (
    <Modal isOpen={!!statusModal} onClose={onClose} title="Update Order Status" description="Advance through the fulfilment pipeline" maxWidth="sm">
      <div className="grid gap-2 py-3">
        {STATUS_OPTIONS.filter(s => s !== "CANCELLED").map(opt => {
          const cfg = STATUS_CONFIG[opt];
          const isCurrent = statusModal?.status === opt;
          return (
            <button
              key={opt}
              onClick={async () => {
                if (statusModal) {
                  await onUpdateStatus(statusModal.id, opt);
                  onClose();
                }
              }}
              className={`flex items-center gap-3 w-full px-5 py-4 rounded-xl border text-sm font-bold transition-all ${isCurrent ? "border-primary/40 bg-primary/10 text-primary" : "border-border/30 hover:border-border/60 hover:bg-muted/20"}`}
            >
              <span className={isCurrent ? "text-primary" : cfg.color}>{cfg.icon}</span>
              {cfg.label}
              {isCurrent && <span className="ml-auto text-xs text-primary/60 font-normal">Current</span>}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
