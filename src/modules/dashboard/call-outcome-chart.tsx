"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
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

/** Theme accents — blue, yellow, navy, red */
const OUTCOME_FILLS: Record<string, string> = {
  Completed: "#3b82f6",
  "No Answer": "#eab308",
  Busy: "#2c3b59",
  Failed: "#dc2626",
};

const OUTCOME_LEGEND: Record<string, { soft: string; border: string }> = {
  Completed: { soft: "bg-[#3b82f6]/8", border: "border-[#3b82f6]/20" },
  "No Answer": { soft: "bg-[#eab308]/10", border: "border-[#eab308]/25" },
  Busy: { soft: "bg-[#2c3b59]/8", border: "border-[#2c3b59]/18" },
  Failed: { soft: "bg-[#dc2626]/8", border: "border-[#dc2626]/20" },
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
    <div className="rounded-[6px] border border-border/60 bg-card/95 px-3 py-2 shadow-elevated backdrop-blur-sm">
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
    fill: OUTCOME_FILLS[d.name] ?? "#6b778c",
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
      className="bg-card"
      action={
        <div className="rounded-[6px] border border-[#2c3b59]/15 bg-[#2c3b59]/6 px-2.5 py-1.5 text-right">
          <p className="text-sm font-semibold tabular-nums leading-none text-[#2c3b59]">
            {total.toLocaleString()}
          </p>
          <p className="mt-1 text-[9px] font-medium text-muted-foreground">
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
                  paddingAngle={3}
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
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#3b82f6]">
              Connected
            </p>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-1.5 pt-3">
          {styled.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            const legend = OUTCOME_LEGEND[item.name];
            return (
              <div
                key={item.name}
                className={cn(
                  "flex items-center gap-2 rounded-[6px] border px-2 py-1.5",
                  legend?.soft ?? "bg-card",
                  legend?.border ?? "border-border/60"
                )}
              >
                <span
                  className="size-2 shrink-0 rounded-[3px]"
                  style={{ backgroundColor: item.fill }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-medium text-muted-foreground">
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
