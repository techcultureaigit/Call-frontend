"use client";

import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  Calendar,
  Plus,
  ScrollText,
  Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber } from "@/lib/utils";

export function ActivityLogsStatsBar({
  stats,
  isLoading,
}: {
  stats?: {
    total: number;
    today: number;
    creates: number;
    updates: number;
    deletes: number;
    withChanges: number;
  };
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    {
      label: "Total Events",
      value: stats.total,
      icon: ScrollText,
      color: "text-primary",
      bg: "bg-primary/8",
    },
    {
      label: "Today",
      value: stats.today,
      icon: Calendar,
      color: "text-violet-600",
      bg: "bg-violet-500/8",
    },
    {
      label: "Creates",
      value: stats.creates,
      icon: Plus,
      color: "text-emerald-600",
      bg: "bg-emerald-500/8",
    },
    {
      label: "Updates",
      value: stats.updates,
      icon: ArrowRightLeft,
      color: "text-blue-600",
      bg: "bg-blue-500/8",
    },
    {
      label: "Deletes",
      value: stats.deletes,
      icon: Trash2,
      color: "text-red-600",
      bg: "bg-red-500/8",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-card"
        >
          <div className={`rounded-lg p-2.5 ${item.bg}`}>
            <item.icon className={`size-4 ${item.color}`} />
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums">
              {formatCompactNumber(item.value)}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              {item.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
