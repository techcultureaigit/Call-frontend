"use client";

import { cn } from "@/lib/utils";
import type { SurveyDisplayStatus } from "@/lib/utils/survey-readiness";

const STATUS_STYLES: Record<
  SurveyDisplayStatus,
  { label: string; className: string; dotClassName?: string }
> = {
  draft: {
    label: "Draft",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    dotClassName: "bg-amber-500",
  },
  scheduled: {
    label: "Scheduled",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dotClassName: "bg-emerald-500",
  },
  processing: {
    label: "Processing",
    className:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400",
    dotClassName: "bg-violet-500",
  },
  completed: {
    label: "Completed",
    className:
      "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    dotClassName: "bg-slate-500",
  },
};

interface SurveyStatusBadgeProps {
  status: SurveyDisplayStatus;
  className?: string;
  withDot?: boolean;
  size?: "sm" | "md";
}

export function SurveyStatusBadge({
  status,
  className,
  withDot = false,
  size = "sm",
}: SurveyStatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.draft;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-[11px]",
        style.className,
        className
      )}
    >
      {withDot && style.dotClassName ? (
        <span
          className={cn("size-1.5 animate-pulse rounded-full", style.dotClassName)}
        />
      ) : null}
      {style.label}
    </span>
  );
}
