"use client";

import {
  CheckCircle2,
  Clock3,
  Mic,
  Minus,
  Phone,
  PhoneMissed,
  PhoneOutgoing,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReportKpi } from "@/types/reports";

const config: Record<
  string,
  { icon: typeof Phone; accent: string; bar: string }
> = {
  phone: {
    icon: Phone,
    accent: "text-sky-600 dark:text-sky-400",
    bar: "bg-sky-500",
  },
  connected: {
    icon: PhoneOutgoing,
    accent: "text-teal-600 dark:text-teal-400",
    bar: "bg-teal-500",
  },
  check: {
    icon: CheckCircle2,
    accent: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  clock: {
    icon: Clock3,
    accent: "text-violet-600 dark:text-violet-400",
    bar: "bg-violet-500",
  },
  missed: {
    icon: PhoneMissed,
    accent: "text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
  },
  mic: {
    icon: Mic,
    accent: "text-indigo-600 dark:text-indigo-400",
    bar: "bg-indigo-500",
  },
};

function TrendBadge({ kpi }: { kpi: ReportKpi }) {
  const isMissed = kpi.id === "missed";
  const positive = isMissed ? kpi.change <= 0 : kpi.trend !== "down";
  const Icon =
    kpi.trend === "up"
      ? TrendingUp
      : kpi.trend === "down"
        ? TrendingDown
        : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
        positive
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
      )}
    >
      <Icon className="size-3" />
      {kpi.change > 0 ? "+" : ""}
      {kpi.change}%
    </span>
  );
}

export function AnalyticsFeaturedKpis({
  kpis,
  isLoading,
}: {
  kpis: ReportKpi[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-[6px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {kpis.slice(0, 6).map((kpi) => {
        const key = kpi.icon || "phone";
        const cfg = config[key] || config.phone;
        const Icon = cfg.icon;

        return (
          <div
            key={kpi.id}
            className="relative overflow-hidden rounded-[6px] border border-border/50 bg-card p-3 shadow-card transition-shadow hover:shadow-elevated"
          >
            <span
              className={cn("absolute inset-x-0 top-0 h-0.5", cfg.bar)}
              aria-hidden
            />
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-[6px] bg-muted/60",
                  cfg.accent
                )}
              >
                <Icon className="size-4" />
              </span>
              <TrendBadge kpi={kpi} />
            </div>
            <p className="mt-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </p>
            <p className="font-display mt-0.5 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {kpi.value}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {kpi.changeLabel}
            </p>
          </div>
        );
      })}
    </div>
  );
}
