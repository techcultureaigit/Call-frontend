"use client";

import { ArrowRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditChange } from "@/types/activity-log";

interface ActivityLogChangesProps {
  changes: AuditChange[];
  compact?: boolean;
}

export function ActivityLogChanges({
  changes,
  compact = false,
}: ActivityLogChangesProps) {
  if (changes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No field changes recorded.</p>
    );
  }

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      {changes.map((change) => (
        <div
          key={change.field}
          className={cn(
            "rounded-lg border border-border/60 bg-muted/20",
            compact ? "p-2.5" : "p-3"
          )}
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {change.field}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <ChangeValue value={change.before} variant="before" />
            <ArrowRight className="hidden size-3.5 shrink-0 text-muted-foreground sm:block" />
            <ChangeValue value={change.after} variant="after" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChangeValue({
  value,
  variant,
}: {
  value: string | null;
  variant: "before" | "after";
}) {
  const isEmpty = value === null || value === "";

  return (
    <div
      className={cn(
        "min-w-0 flex-1 rounded-md px-2.5 py-1.5 font-mono text-xs",
        variant === "before"
          ? "bg-red-500/8 text-red-700 dark:text-red-400"
          : "bg-emerald-500/8 text-emerald-700 dark:text-emerald-400",
        isEmpty && "bg-muted/40 text-muted-foreground"
      )}
    >
      {isEmpty ? (
        <span className="inline-flex items-center gap-1">
          <Minus className="size-3" />
          empty
        </span>
      ) : (
        <span className="break-all">{value}</span>
      )}
    </div>
  );
}
