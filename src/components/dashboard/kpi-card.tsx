"use client";

import {
  Bot,
  CheckCircle2,
  ClipboardList,
  Clock,
  Database,
  FilePlus2,
  Loader,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DashboardKpi } from "@/types/dashboard";

export const kpiIconMap: Record<string, LucideIcon> = {
  phone: Phone,
  "phone-incoming": PhoneIncoming,
  "phone-missed": PhoneMissed,
  "check-circle": CheckCircle2,
  clipboard: ClipboardList,
  clock: Clock,
  database: Database,
  "file-plus": FilePlus2,
  loader: Loader,
  bot: Bot,
};

type TileTone =
  | "violet"
  | "blue"
  | "emerald"
  | "cyan"
  | "amber"
  | "rose"
  | "indigo"
  | "teal";

const toneStyles: Record<
  TileTone,
  { box: string; icon: string; label: string; wash: string }
> = {
  violet: {
    box: "bg-violet-50 border-violet-200/80 dark:bg-violet-500/10 dark:border-violet-500/25",
    icon: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
    label: "text-violet-700/80 dark:text-violet-300/80",
    wash: "text-violet-500/[0.12] dark:text-violet-300/10",
  },
  blue: {
    box: "bg-sky-50 border-sky-200/80 dark:bg-sky-500/10 dark:border-sky-500/25",
    icon: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
    label: "text-sky-700/80 dark:text-sky-300/80",
    wash: "text-sky-500/[0.12] dark:text-sky-300/10",
  },
  emerald: {
    box: "bg-emerald-50 border-emerald-200/80 dark:bg-emerald-500/10 dark:border-emerald-500/25",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    label: "text-emerald-700/80 dark:text-emerald-300/80",
    wash: "text-emerald-500/[0.12] dark:text-emerald-300/10",
  },
  cyan: {
    box: "bg-cyan-50 border-cyan-200/80 dark:bg-cyan-500/10 dark:border-cyan-500/25",
    icon: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
    label: "text-cyan-700/80 dark:text-cyan-300/80",
    wash: "text-cyan-500/[0.12] dark:text-cyan-300/10",
  },
  amber: {
    box: "bg-amber-50 border-amber-200/80 dark:bg-amber-500/10 dark:border-amber-500/25",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    label: "text-amber-700/80 dark:text-amber-300/80",
    wash: "text-amber-500/[0.14] dark:text-amber-300/10",
  },
  rose: {
    box: "bg-rose-50 border-rose-200/80 dark:bg-rose-500/10 dark:border-rose-500/25",
    icon: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
    label: "text-rose-700/80 dark:text-rose-300/80",
    wash: "text-rose-500/[0.12] dark:text-rose-300/10",
  },
  indigo: {
    box: "bg-indigo-50 border-indigo-200/80 dark:bg-indigo-500/10 dark:border-indigo-500/25",
    icon: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
    label: "text-indigo-700/80 dark:text-indigo-300/80",
    wash: "text-indigo-500/[0.12] dark:text-indigo-300/10",
  },
  teal: {
    box: "bg-teal-50 border-teal-200/80 dark:bg-teal-500/10 dark:border-teal-500/25",
    icon: "bg-teal-500/15 text-teal-600 dark:text-teal-300",
    label: "text-teal-700/80 dark:text-teal-300/80",
    wash: "text-teal-500/[0.12] dark:text-teal-300/10",
  },
};

const accentToTone: Record<string, TileTone> = {
  blue: "blue",
  emerald: "emerald",
  violet: "violet",
  cyan: "cyan",
  indigo: "indigo",
  slate: "teal",
  amber: "amber",
  rose: "rose",
};

/** Clear colored metric box — value + label + icon */
export function MetricBox({
  kpi,
  index = 0,
}: {
  kpi: DashboardKpi;
  index?: number;
}) {
  const Icon = kpiIconMap[kpi.icon] ?? ClipboardList;
  const tone = accentToTone[kpi.accent ?? "violet"] ?? "violet";
  const styles = toneStyles[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[6px] border p-4 shadow-subtle",
        styles.box
      )}
    >
      <Icon
        aria-hidden
        strokeWidth={1.15}
        className={cn(
          "pointer-events-none absolute -bottom-1 -right-1 size-12 rotate-[-10deg]",
          styles.wash
        )}
      />

      <div className="relative z-[1]">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-[6px]",
            styles.icon
          )}
        >
          <Icon className="size-4" strokeWidth={2.25} />
        </div>
      </div>

      <p className="relative z-[1] mt-4 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {kpi.value}
      </p>
      <p className={cn("relative z-[1] mt-1 text-[12px] font-medium", styles.label)}>
        {kpi.label}
      </p>
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
