"use client";

import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Megaphone,
  Minus,
  Phone,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DashboardKpi, TrendDirection } from "@/types/dashboard";

const iconMap: Record<string, LucideIcon> = {
  phone: Phone,
  "check-circle": CheckCircle2,
  megaphone: Megaphone,
  users: Users,
  clipboard: ClipboardList,
  clock: Clock,
};

interface KpiCardProps {
  kpi: DashboardKpi;
  index?: number;
}

function TrendBadge({
  trend,
  change,
}: {
  trend: TrendDirection;
  change: number;
}) {
  const Icon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
        trend === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        trend === "down" && "bg-red-500/10 text-red-600 dark:text-red-400",
        trend === "neutral" && "bg-muted text-muted-foreground"
      )}
    >
      <Icon className="size-3" />
      {trend === "neutral" ? "—" : `${Math.abs(change)}%`}
    </span>
  );
}

export function KpiCard({ kpi, index = 0 }: KpiCardProps) {
  const Icon = iconMap[kpi.icon] ?? Phone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-xl border border-border/60 bg-card p-4 shadow-card transition-shadow duration-200 hover:shadow-elevated sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon className="size-[18px]" />
        </div>
        <TrendBadge trend={kpi.trend} change={kpi.change} />
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          {kpi.value}
        </p>
        <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
        <p className="text-[10px] text-muted-foreground/70">{kpi.changeLabel}</p>
      </div>
    </motion.div>
  );
}
