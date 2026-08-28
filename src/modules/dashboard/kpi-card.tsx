"use client";

import {
  Bot,
  CheckCircle2,
  ClipboardList,
  Clock,
  Database,
  FilePlus2,
  Loader,
  MessageSquare,
  Mic,
  Percent,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DashboardKpi } from "@/types/dashboard";

export const kpiIconMap: Record<string, LucideIcon> = {
  phone: Phone,
  connected: PhoneOutgoing,
  "phone-incoming": PhoneIncoming,
  "phone-missed": PhoneMissed,
  missed: PhoneMissed,
  check: CheckCircle2,
  "check-circle": CheckCircle2,
  clipboard: ClipboardList,
  clock: Clock,
  database: Database,
  "file-plus": FilePlus2,
  loader: Loader,
  bot: Bot,
  mic: Mic,
  percent: Percent,
  users: Users,
  message: MessageSquare,
  "trending-up": TrendingUp,
};

type IconAccent = "navy" | "blue";

const iconAccentStyles: Record<IconAccent, string> = {
  navy: "bg-[#2c3b59]/10 text-[#2c3b59]",
  blue: "bg-[#3b82f6]/10 text-[#3b82f6]",
};

const ICON_ACCENTS: IconAccent[] = [
  "navy",
  "navy",
  "navy",
  "navy",
  "navy",
  "navy",
];

/** Compact stat card — icon left, value + label right */
export function MetricBox({
  kpi,
  index = 0,
  compact = false,
}: {
  kpi: DashboardKpi;
  index?: number;
  compact?: boolean;
}) {
  const Icon = kpiIconMap[kpi.icon] ?? ClipboardList;
  const accent = ICON_ACCENTS[index % ICON_ACCENTS.length] ?? "navy";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.22 }}
      className={cn(
        "flex min-h-[88px] items-center gap-3 rounded-[6px] border border-border/60 bg-card shadow-subtle",
        "transition-colors hover:border-[#2c3b59]/20 hover:bg-[#2c3b59]/2",
        compact ? "px-3 py-3" : "px-4 py-4"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[6px]",
          compact ? "size-8" : "size-10",
          iconAccentStyles[accent]
        )}
      >
        <Icon
          className={compact ? "size-4" : "size-[18px]"}
          strokeWidth={2}
          aria-hidden
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-semibold tabular-nums leading-none tracking-tight text-foreground",
            compact ? "text-lg" : "text-xl"
          )}
        >
          {kpi.value}
        </p>
        <p
          className={cn(
            "mt-1.5 truncate font-normal leading-snug text-muted-foreground",
            compact ? "text-[11px]" : "text-xs"
          )}
          title={kpi.label}
        >
          {kpi.label}
        </p>
      </div>
    </motion.div>
  );
}

/** Flat grid fallback */
export function KpiCard({
  kpi,
  index = 0,
}: {
  kpi: DashboardKpi;
  index?: number;
}) {
  return <MetricBox kpi={kpi} index={index} />;
}
