"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber } from "@/lib/utils";

export function NotificationsStatsBar({
  stats,
  isLoading,
}: {
  stats?: {
    total: number;
    unread: number;
    read: number;
    info: number;
    success: number;
    warning: number;
    error: number;
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
      label: "Total",
      value: stats.total,
      icon: Bell,
      color: "text-primary",
      bg: "bg-primary/8",
    },
    {
      label: "Unread",
      value: stats.unread,
      icon: Bell,
      color: "text-violet-600",
      bg: "bg-violet-500/8",
    },
    {
      label: "Success",
      value: stats.success,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-500/8",
    },
    {
      label: "Warnings",
      value: stats.warning,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-500/8",
    },
    {
      label: "Errors",
      value: stats.error,
      icon: XCircle,
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
