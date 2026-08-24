"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReportKpi } from "@/types/reports";

const ACCENT: Record<string, string> = {
  phone: "bg-sky-500",
  connected: "bg-teal-500",
  check: "bg-emerald-500",
  clock: "bg-violet-500",
  missed: "bg-rose-500",
  mic: "bg-indigo-500",
};

export function AnalyticsKpiStrip({
  kpis,
  isLoading,
}: {
  kpis: ReportKpi[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[8px] border border-border/40 bg-border/30 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] rounded-none bg-card" />
        ))}
      </div>
    );
  }

  const items = kpis.slice(0, 6);

  return (
    <div className="relative overflow-hidden rounded-[8px] border border-border/40 bg-card/60">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-sky-500/50 via-brand/40 to-violet-500/50" />
      <div className="grid grid-cols-3 divide-x divide-border/25 sm:grid-cols-6">
        {items.map((kpi) => {
          const dot = ACCENT[kpi.icon ?? "phone"] ?? "bg-brand";
          return (
            <div
              key={kpi.id}
              className="group px-2.5 py-2 transition-colors hover:bg-muted/25"
            >
              <div className="flex items-center gap-1">
                <span
                  className={cn("size-1.5 shrink-0 rounded-full", dot)}
                  aria-hidden
                />
                <span className="truncate text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </span>
              </div>
              <p className="mt-0.5 font-display text-[15px] font-semibold tabular-nums leading-none tracking-tight text-foreground">
                {kpi.value}
              </p>
              <p className="mt-0.5 truncate text-[9px] text-muted-foreground/90">
                {kpi.changeLabel}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
