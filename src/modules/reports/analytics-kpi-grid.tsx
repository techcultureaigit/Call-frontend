"use client";

import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  Minus,
  Phone,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  Split,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReportKpi } from "@/types/reports";
import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";

const KPI_ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  connected: PhoneOutgoing,
  disconnected: PhoneOff,
  missed: PhoneMissed,
  check: CheckCircle2,
  partial: Split,
  processing: Loader2,
  incomplete: CircleDashed,
};

const KPI_ICON_KEY: Record<string, string> = {
  total_calls: "phone",
  connected: "connected",
  disconnected: "disconnected",
  missed: "missed",
  survey_complete: "check",
  survey_partial: "partial",
  survey_processing: "processing",
  survey_incomplete: "incomplete",
};

function TrendCaption({ kpi }: { kpi: ReportKpi }) {
  const isMissed =
    kpi.id === "missed" || kpi.id === "survey_incomplete";
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
        "mt-1 flex items-center gap-1 truncate text-[10px] font-medium",
        positive ? "text-[#2c3b59]/80" : "text-[#dc2626]"
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex min-h-[88px] items-center gap-3 rounded-[6px] border border-border/50 bg-card px-4 py-4"
          >
            <Skeleton className="size-10 shrink-0 rounded-[6px]" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {kpis.slice(0, 8).map((kpi, index) => {
        const iconKey = kpi.icon ?? KPI_ICON_KEY[kpi.id] ?? "phone";
        const Icon = KPI_ICONS[iconKey] ?? Phone;
        const isSelected = selectedId === kpi.id;

        return (
          <motion.button
            key={kpi.id}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.22 }}
            onClick={() => onSelect?.(kpi.id as AnalyticsKpiFilterId)}
            title="Click to open details"
            className={cn(
              "flex min-h-[88px] w-full min-w-0 items-center gap-3 rounded-[6px] border bg-card px-4 py-4 text-left shadow-subtle transition-colors",
              "hover:border-[#2c3b59]/20 hover:bg-[#2c3b59]/2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c3b59]/25",
              isSelected
                ? "border-[#2c3b59]/30 ring-1 ring-[#2c3b59]/15"
                : "border-border/60"
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-[#2c3b59]/10 text-[#2c3b59]">
              <Icon className="size-[18px]" strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-semibold tabular-nums leading-none tracking-tight text-foreground">
                {kpi.value}
              </p>
              <p className="mt-1.5 truncate text-xs text-muted-foreground">
                {kpi.label}
              </p>
              <TrendCaption kpi={kpi} />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
