"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2, UserCheck, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { CUSTOMER_STATUS_OPTIONS } from "@/lib/constants/customers";
import type { CustomerStatus } from "@/types/customer";

interface CustomersBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkStatus: (status: CustomerStatus) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export function CustomersBulkActions({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkStatus,
  isDeleting,
  isUpdating,
}: CustomersBulkActionsProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2"
        >
          <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-background/95 px-4 py-3 shadow-elevated backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedCount} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-7 text-xs text-muted-foreground"
              >
                <X className="size-3.5" />
                Clear
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value=""
                onChange={(e) => {
                  const status = e.target.value as CustomerStatus;
                  if (status) onBulkStatus(status);
                }}
                options={[
                  { label: "Set status…", value: "" },
                  ...CUSTOMER_STATUS_OPTIONS,
                ]}
                className="h-8 w-[140px] text-xs"
                disabled={isUpdating}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkStatus("active")}
                disabled={isUpdating}
                className="h-8"
              >
                <UserCheck className="size-3.5" />
                Activate
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkStatus("inactive")}
                disabled={isUpdating}
                className="h-8"
              >
                <UserX className="size-3.5" />
                Deactivate
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
                disabled={isDeleting}
                className="h-8"
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
