"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CheckCircle2,
  Clock,
  PhoneMissed,
  PhoneOff,
  PieChart as PieChartIcon,
  type LucideIcon,
} from "lucide-react";
import { useMounted } from "@/hooks";
import { ChartSkeleton } from "./dashboard-skeleton";
import { DashboardCard } from "./dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { CallOutcomeSlice } from "@/types/dashboard";

interface CallOutcomeChartProps {
  data: CallOutcomeSlice[];
  isLoading?: boolean;
}

const OUTCOME_STYLE: Record<
  string,
  { fill: string; soft: string; border: string; text: string; icon: LucideIcon }
> = {
  Completed: {
    fill: "#34d399",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200/80 dark:border-emerald-500/25",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  "No Answer": {
    fill: "#38bdf8",
    soft: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200/80 dark:border-sky-500/25",
    text: "text-sky-700 dark:text-sky-300",
    icon: PhoneMissed,
  },
  Busy: {
    fill: "#2dd4bf",
    soft: "bg-teal-50 dark:bg-teal-500/10",
    border: "border-teal-200/80 dark:border-teal-500/25",
    text: "text-teal-700 dark:text-teal-300",
    icon: Clock,
  },
  Failed: {
    fill: "#fb923c",
    soft: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200/80 dark:border-amber-500/25",
    text: "text-amber-700 dark:text-amber-300",
    icon: PhoneOff,
  },
};

function OutcomeTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const name = String(payload[0]?.name ?? "");
  const value = Number(payload[0]?.value ?? 0);
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-[6px] border border-border/60 bg-white/95 px-3 py-2 shadow-elevated backdrop-blur-sm dark:bg-card/95">
      <p className="text-[11px] font-semibold text-foreground">{name}</p>
      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
        {value.toLocaleString()} · {pct}%
      </p>
    </div>
  );
}

export function CallOutcomeChart({ data, isLoading }: CallOutcomeChartProps) {
  const mounted = useMounted();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const completedPct = Math.round(
    ((data.find((d) => d.name === "Completed")?.value ?? 0) / (total || 1)) *
      100
  );

  const styled = data.map((d) => ({
    ...d,
    fill: OUTCOME_STYLE[d.name]?.fill ?? d.fill,
  }));

  if (isLoading) {
    return (
      <DashboardCard
        title="Call Outcomes"
        description="Status mix across voice AI calls"
      >
        <ChartSkeleton height={220} />
      </DashboardCard>
    );
  }

  if (data.length === 0 || total === 0) {
    return (
      <DashboardCard
        title="Call Outcomes"
        description="Status mix across voice AI calls"
      >
        <EmptyState
          icon={PieChartIcon}
          title="No outcome data"
          description="Call outcome distribution will appear once calls are logged."
          compact
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Call Outcomes"
      description="Status mix across voice AI calls"
      icon={PieChartIcon}
      className="bg-gradient-to-br from-emerald-50/40 via-card to-violet-50/30 dark:from-emerald-500/5 dark:via-card dark:to-violet-500/5"
      action={
        <div className="rounded-[6px] border border-violet-200/70 bg-violet-50 px-2.5 py-1.5 text-right dark:border-violet-500/25 dark:bg-violet-500/10">
          <p className="text-sm font-semibold tabular-nums leading-none text-violet-700 dark:text-violet-300">
            {total.toLocaleString()}
          </p>
          <p className="mt-1 text-[9px] font-medium text-violet-500/80">
            Total calls
          </p>
        </div>
      }
    >
      <div className="flex min-h-[220px] flex-1 flex-col">
        <div className="relative mx-auto h-[140px] w-full max-w-[180px] shrink-0">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={styled}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={3}
                  stroke="var(--card)"
                  cornerRadius={6}
                >
                  {styled.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<OutcomeTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-semibold tabular-nums leading-none text-foreground">
              {completedPct}%
            </p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
              Connected
            </p>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-1.5 pt-3">
          {styled.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            const style = OUTCOME_STYLE[item.name];
            const Icon = style?.icon ?? PieChartIcon;
            return (
              <div
                key={item.name}
                className={cn(
                  "relative flex items-center gap-2 overflow-hidden rounded-[6px] border px-2 py-1.5",
                  style?.soft,
                  style?.border
                )}
              >
                <Icon
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -bottom-1 -right-1 size-7 opacity-[0.12]",
                    style?.text
                  )}
                />
                <span
                  className="size-2 shrink-0 rounded-[3px]"
                  style={{ backgroundColor: item.fill }}
                />
                <div className="relative z-[1] min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-[10px] font-medium",
                      style?.text
                    )}
                  >
                    {item.name}
                  </p>
                  <p className="text-[12px] font-semibold tabular-nums text-foreground">
                    {pct}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
}
