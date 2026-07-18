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
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  DashboardKpi,
  KpiAccent,
  TrendDirection,
} from "@/types/dashboard";

const iconMap: Record<string, LucideIcon> = {
  phone: Phone,
  "check-circle": CheckCircle2,
  megaphone: Megaphone,
  users: Users,
  clipboard: ClipboardList,
  clock: Clock,
};

const accentTile: Record<KpiAccent, string> = {
  blue: "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  violet: "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
  cyan: "bg-cyan-500/10 text-cyan-600 ring-cyan-500/20 dark:text-cyan-400",
  indigo: "bg-indigo-500/10 text-indigo-600 ring-indigo-500/20 dark:text-indigo-400",
  slate: "bg-teal-500/10 text-teal-600 ring-teal-500/20 dark:text-teal-400",
};

const accentGlow: Record<KpiAccent, string> = {
  blue: "before:from-blue-500/12",
  emerald: "before:from-emerald-500/12",
  violet: "before:from-violet-500/12",
  cyan: "before:from-cyan-500/12",
  indigo: "before:from-indigo-500/12",
  slate: "before:from-teal-500/12",
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
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums",
        trend === "up" &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        trend === "down" && "bg-red-500/10 text-red-600 dark:text-red-400",
        trend === "neutral" && "bg-muted text-muted-foreground"
      )}
    >
      <Icon className="size-3.5" />
      {trend === "neutral" ? "—" : `${Math.abs(change)}%`}
    </span>
  );
}

export function KpiCard({ kpi, index = 0 }: KpiCardProps) {
  const Icon = iconMap[kpi.icon] ?? Phone;
  const accent = kpi.accent ?? "blue";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated",
          "before:pointer-events-none before:absolute before:-right-8 before:-top-10 before:size-32 before:rounded-full before:bg-linear-to-br before:to-transparent before:blur-2xl before:opacity-70",
          accentGlow[accent]
        )}
      >
        <div className="relative flex items-center justify-between gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-105",
              accentTile[accent]
            )}
          >
            <Icon className="size-5" />
          </div>
          <TrendBadge trend={kpi.trend} change={kpi.change} />
        </div>

        <div className="relative mt-5 space-y-1">
          <p className="text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums text-foreground">
            {kpi.value}
          </p>
          <p className="text-[13px] font-medium text-muted-foreground">
            {kpi.label}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
