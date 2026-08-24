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
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReportKpi } from "@/types/reports";
import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";

const CONFIG: Record<
  string,
  { icon: typeof Phone; accent: string; bar: string; iconBg: string }
> = {
  phone: {
    icon: Phone,
    accent: "text-sky-600 dark:text-sky-400",
    bar: "bg-sky-500",
    iconBg: "bg-sky-500/12",
  },
  connected: {
    icon: PhoneOutgoing,
    accent: "text-teal-600 dark:text-teal-400",
    bar: "bg-teal-500",
    iconBg: "bg-teal-500/12",
  },
  check: {
    icon: CheckCircle2,
    accent: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-500/12",
  },
  clock: {
    icon: Clock3,
    accent: "text-violet-600 dark:text-violet-400",
    bar: "bg-violet-500",
    iconBg: "bg-violet-500/12",
  },
  missed: {
    icon: PhoneMissed,
    accent: "text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
    iconBg: "bg-rose-500/12",
  },
  mic: {
    icon: Mic,
    accent: "text-indigo-600 dark:text-indigo-400",
    bar: "bg-indigo-500",
    iconBg: "bg-indigo-500/12",
  },
};

const KPI_ICON: Record<string, string> = {
  total_calls: "phone",
  connected: "connected",
  survey_complete: "check",
  avg_duration: "clock",
  missed: "missed",
  recording: "mic",
};

function TrendCaption({ kpi }: { kpi: ReportKpi }) {
  const isMissed = kpi.id === "missed";
  const positive = isMissed ? kpi.change <= 0 : kpi.trend !== "down";
  const TrendIcon =
    kpi.trend === "up"
      ? TrendingUp
      : kpi.trend === "down"
        ? TrendingDown
        : Minus;

  const showSigned =
    kpi.id === "total_calls" ||
    kpi.id === "avg_duration" ||
    kpi.changeLabel.includes("vs prior");

  return (
    <p
      className={cn(
        "mt-1 flex items-center gap-1 truncate text-[11px] font-medium",
        positive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
      )}
    >
      <TrendIcon className="size-3 shrink-0" />
      {showSigned ? (
        <span className="tabular-nums">
          {kpi.change > 0 ? "+" : ""}
          {kpi.change}%
        </span>
      ) : null}
      <span className="truncate text-muted-foreground">{kpi.changeLabel}</span>
    </p>
  );
}

export function AnalyticsKpiGrid({
  kpis,
  isLoading,
  selectedId = "total_calls",
  onSelect,
}: {
  kpis: ReportKpi[];
  isLoading?: boolean;
  selectedId?: string;
  onSelect?: (id: AnalyticsKpiFilterId) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[108px] rounded-[6px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {kpis.slice(0, 6).map((kpi, index) => {
        const iconKey = kpi.icon ?? KPI_ICON[kpi.id] ?? "phone";
        const cfg = CONFIG[iconKey] ?? CONFIG.phone;
        const Icon = cfg.icon;

        const isSelected = selectedId === kpi.id;

        return (
          <motion.button
            key={kpi.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            onClick={() => onSelect?.(kpi.id as AnalyticsKpiFilterId)}
            title="Click to view client details"
            className={cn(
              "relative w-full cursor-pointer overflow-hidden rounded-[6px] border bg-card p-3.5 text-left shadow-card transition-all",
              "hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
              isSelected
                ? "border-brand/50 ring-2 ring-brand/20 shadow-elevated"
                : "border-border/55"
            )}
          >
            <span
              className={cn("absolute inset-x-0 top-0 h-0.5", cfg.bar)}
              aria-hidden
            />

            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full",
                  cfg.iconBg,
                  cfg.accent
                )}
              >
                <Icon className="size-[18px]" strokeWidth={2.2} />
              </span>
            </div>

            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </p>
            <p className="font-display mt-0.5 text-2xl font-semibold tabular-nums leading-none tracking-tight text-foreground">
              {kpi.value}
            </p>
            <TrendCaption kpi={kpi} />
          </motion.button>
        );
      })}
    </div>
  );
}
