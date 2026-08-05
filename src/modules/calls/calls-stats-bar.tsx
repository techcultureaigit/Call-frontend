"use client";

import { motion } from "framer-motion";
import { CheckCircle2, PhoneCall, Voicemail, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber } from "@/lib/utils";

interface CallsStatsBarProps {
  stats?: {
    live: number;
    completed: number;
    failed: number;
    withRecording: number;
    total: number;
  };
  isLoading?: boolean;
}

export function CallsStatsBar({ stats, isLoading }: CallsStatsBarProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-[6px]" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    {
      label: "Live / Queued",
      value: stats.live,
      icon: PhoneCall,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/8",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/8",
    },
    {
      label: "Failed",
      value: stats.failed,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/8",
    },
    {
      label: "Recordings",
      value: stats.withRecording,
      icon: Voicemail,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/8",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
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
