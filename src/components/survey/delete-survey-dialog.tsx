"use client";

import { AlertTriangle, Ban, Trash2 } from "lucide-react";
import { AppLoaderSpinner } from "@/components/ui/app-loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types/agent";

interface DeleteSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Single survey delete */
  agent?: Agent | null;
  /** Bulk delete targets (used when agent is not set) */
  agents?: Agent[];
  onConfirm: () => void;
  isDeleting?: boolean;
}

function surveyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function DeleteSurveyDialog({
  open,
  onOpenChange,
  agent = null,
  agents = [],
  onConfirm,
  isDeleting,
}: DeleteSurveyDialogProps) {
  const isBulk = !agent && agents.length > 0;
  const items = agent ? [agent] : agents;
  const count = items.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden border-destructive/20 p-0 shadow-elevated sm:max-w-[420px]",
          "data-[state=open]:zoom-in-95"
        )}
      >
        {/* Hero warning band */}
        <div className="relative overflow-hidden border-b border-destructive/15 bg-linear-to-b from-destructive/12 via-destructive/5 to-transparent px-6 pb-5 pt-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-destructive/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-6 bottom-0 size-24 rounded-full bg-destructive/8 blur-xl"
          />

          <DialogHeader className="relative items-center gap-4 text-center sm:items-center sm:text-center">
            <div className="relative">
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-[6px] bg-destructive/25 opacity-40"
                style={{ animationDuration: "2.2s" }}
              />
              <span className="relative flex size-16 items-center justify-center rounded-[6px] bg-card text-destructive shadow-elevated ring-1 ring-destructive/25">
                <Trash2 className="size-7" strokeWidth={1.75} />
                <span className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-subtle ring-2 ring-card">
                  <AlertTriangle className="size-3.5" strokeWidth={2.5} />
                </span>
              </span>
            </div>

            <div className="space-y-2">
              <DialogTitle className="font-display text-xl font-semibold tracking-tight text-foreground">
                {isBulk
                  ? `Delete ${count} survey${count === 1 ? "" : "s"}?`
                  : "Delete this survey?"}
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-[320px] text-sm leading-relaxed text-muted-foreground">
                {isBulk ? (
                  <>
                    <span className="font-semibold text-foreground">
                      {count} survey{count === 1 ? "" : "s"}
                    </span>{" "}
                    will be permanently removed. Conversations and config linked
                    to them will no longer be available.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">
                      {agent?.name ?? "This survey"}
                    </span>{" "}
                    will be permanently removed. This action cannot be undone.
                  </>
                )}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {/* Survey preview cards */}
        {count > 0 ? (
          <div className="space-y-2.5 px-6 py-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {isBulk ? "Will be deleted" : "Survey"}
              </p>
              {isBulk ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive ring-1 ring-destructive/20">
                  <Ban className="size-3" />
                  {count} selected
                </span>
              ) : null}
            </div>

            <ul className="max-h-44 space-y-2 overflow-y-auto pr-0.5">
              {items.slice(0, 6).map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-[6px] border border-border/60 bg-muted/30 px-3 py-2.5 transition-colors"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-destructive/10 font-display text-[11px] font-bold text-destructive ring-1 ring-destructive/15">
                    {surveyInitials(item.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      Voice survey · permanent delete
                    </p>
                  </div>
                  <Trash2
                    className="size-3.5 shrink-0 text-destructive/50"
                    aria-hidden
                  />
                </li>
              ))}
            </ul>

            {count > 6 ? (
              <p className="text-center text-xs text-muted-foreground">
                +{count - 6} more survey{count - 6 === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className="gap-2 border-t border-border/50 bg-muted/25 px-6 py-4 sm:flex-row sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-[6px] border-border/70 bg-card"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Keep surveys
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 flex-1 rounded-[6px] gap-1.5 font-semibold shadow-[0_8px_20px_-8px_color-mix(in_oklch,var(--destructive)_55%,transparent)]"
            onClick={onConfirm}
            disabled={isDeleting || count === 0}
          >
            {isDeleting ? (
              <AppLoaderSpinner size="sm" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isDeleting
              ? "Deleting…"
              : isBulk
                ? `Yes, delete ${count}`
                : "Yes, delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
