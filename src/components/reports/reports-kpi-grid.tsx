"use client";

import { motion } from "framer-motion";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReportKpi } from "@/types/reports";

const trendConfig = {
  up: {
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/8",
  },
  down: {
    icon: TrendingDown,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/8",
  },
  neutral: {
    icon: Minus,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export function ReportsKpiGrid({
  kpis,
  isLoading,
}: {
  kpis: ReportKpi[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-[6px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, i) => {
        const trend = trendConfig[kpi.trend];
        const Icon = trend.icon;
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-[6px] border border-border/60 bg-card p-4 shadow-card"
          >
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
              {kpi.value}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  trend.bg,
                  trend.color
                )}
              >
                <Icon className="size-3" />
                {kpi.change > 0 ? "+" : ""}
                {kpi.change}%
              </span>
              <span className="text-[10px] text-muted-foreground">
                {kpi.changeLabel}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
