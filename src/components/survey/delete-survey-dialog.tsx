"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Agent } from "@/types/agent";

interface DeleteSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Single survey delete */
  agent?: Agent | null;
  /** Bulk delete count (used when agent is not set) */
  count?: number;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteSurveyDialog({
  open,
  onOpenChange,
  agent = null,
  count = 0,
  onConfirm,
  isDeleting,
}: DeleteSurveyDialogProps) {
  const isBulk = !agent && count > 0;
  if (!agent && !isBulk) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isBulk ? `Delete ${count} surveys` : "Delete survey"}
          </DialogTitle>
          <DialogDescription>
            {isBulk ? (
              <>
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  {count} selected survey{count === 1 ? "" : "s"}
                </span>
                ? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  {agent!.name}
                </span>
                ? This action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting
              ? "Deleting…"
              : isBulk
                ? "Delete surveys"
                : "Delete survey"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
