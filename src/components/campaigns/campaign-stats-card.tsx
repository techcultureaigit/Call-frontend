"use client";

import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber, formatPercent } from "@/lib/utils";
import type { CampaignStats } from "@/types/campaign";

interface CampaignStatsCardProps {
  stats?: CampaignStats & { activeCount?: number };
  isLoading?: boolean;
  compact?: boolean;
}

export function CampaignStatsCard({
  stats,
  isLoading,
  compact,
}: CampaignStatsCardProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: compact ? 4 : 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    {
      label: "Total Calls",
      value: formatCompactNumber(stats.totalCalls),
      icon: Phone,
      color: "text-primary",
      bg: "bg-primary/8",
    },
    {
      label: "Completed",
      value: formatCompactNumber(stats.completedCalls),
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/8",
    },
    {
      label: "Failed",
      value: formatCompactNumber(stats.failedCalls),
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/8",
    },
    {
      label: "Success Rate",
      value: formatPercent(stats.successRate),
      icon: Activity,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/8",
    },
    ...(!compact
      ? [
          {
            label: "Responses",
            value: formatCompactNumber(stats.responses),
            icon: MessageSquare,
            color: "text-violet-600 dark:text-violet-400",
            bg: "bg-violet-500/8",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Real-time Stats</h3>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          </div>
          {stats.activeCount !== undefined && (
            <span className="text-xs text-muted-foreground">
              {stats.activeCount} active campaigns
            </span>
          )}
        </div>
      )}

      <div
        className={`grid gap-3 ${compact ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-5"}`}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border/60 bg-card p-4 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2 ${item.bg}`}>
                <item.icon className={`size-4 ${item.color}`} />
              </div>
              {!compact && (
                <Clock className="size-3 text-muted-foreground/50" />
              )}
            </div>
            <p className="mt-3 text-xl font-semibold tabular-nums tracking-tight">
              {item.value}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
