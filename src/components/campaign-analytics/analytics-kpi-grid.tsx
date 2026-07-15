"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Layers,
  MessageSquare,
  Minus,
  Pause,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CampaignAnalyticsKpi } from "@/types/campaign-analytics";

const ICON_MAP: Record<string, LucideIcon> = {
  layers: Layers,
  zap: Zap,
  check: CheckCircle2,
  pause: Pause,
  x: XCircle,
  trending: TrendingUp,
  clock: Clock,
  message: MessageSquare,
  users: Users,
  sparkles: Sparkles,
};

const trendConfig = {
  up: { icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400" },
  down: { icon: TrendingDown, color: "text-red-600 dark:text-red-400" },
  neutral: { icon: Minus, color: "text-muted-foreground" },
};

export function AnalyticsKpiGrid({
  kpis,
  isLoading,
  compareEnabled,
}: {
  kpis: CampaignAnalyticsKpi[];
  isLoading?: boolean;
  compareEnabled?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi, i) => {
        const Icon = ICON_MAP[kpi.icon] ?? Layers;
        const trend = trendConfig[kpi.trend];
        const TrendIcon = trend.icon;

        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.35 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br p-4 shadow-card backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-elevated",
              kpi.gradient
            )}
          >
            <div className="absolute -right-6 -top-6 size-20 rounded-full bg-white/5 blur-2xl transition-transform duration-500 group-hover:scale-125" />
            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight">
                  {kpi.value}
                </p>
                {compareEnabled && kpi.change !== 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <TrendIcon className={cn("size-3", trend.color)} />
                    <span className={cn("text-[10px] font-medium", trend.color)}>
                      {kpi.change > 0 ? "+" : ""}
                      {kpi.change}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {kpi.changeLabel}
                    </span>
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-2 backdrop-blur-md">
                <Icon className="size-4 text-foreground/80" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
