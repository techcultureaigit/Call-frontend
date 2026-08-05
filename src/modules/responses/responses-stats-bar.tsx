"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquareReply,
  ThumbsUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber } from "@/lib/utils";

export function ResponsesStatsBar({
  stats,
  isLoading,
}: {
  stats?: {
    total: number;
    pending: number;
    flagged: number;
    completed: number;
    positive: number;
  };
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-[6px]" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    { label: "Total", value: stats.total, icon: MessageSquareReply, color: "text-primary", bg: "bg-primary/8" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/8" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-500/8" },
    { label: "Flagged", value: stats.flagged, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-500/8" },
    { label: "Positive", value: stats.positive, icon: ThumbsUp, color: "text-violet-600", bg: "bg-violet-500/8" },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-3 rounded-[6px] border border-border/60 bg-card p-4 shadow-card"
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
