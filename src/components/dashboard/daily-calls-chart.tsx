"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { useMounted } from "@/hooks";
import { ChartSkeleton } from "./dashboard-skeleton";
import { DashboardCard } from "./dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { ChartDataPoint } from "@/types/dashboard";

interface DailyCallsChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
}

/** Survey Studio–style pastel bar fills */
const BAR_PALETTE = [
  { solid: "#34d399", soft: "#d1fae5" }, // emerald
  { solid: "#a78bfa", soft: "#ede9fe" }, // violet
  { solid: "#22d3ee", soft: "#cffafe" }, // cyan
  { solid: "#818cf8", soft: "#e0e7ff" }, // indigo
  { solid: "#f472b6", soft: "#fce7f3" }, // rose
  { solid: "#38bdf8", soft: "#e0f2fe" }, // sky
  { solid: "#2dd4bf", soft: "#ccfbf1" }, // teal
  { solid: "#fb923c", soft: "#ffedd5" }, // amber
];

function CallsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] border border-violet-200/80 bg-white/95 px-3 py-2 shadow-elevated backdrop-blur-sm dark:border-violet-500/30 dark:bg-card/95">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
        {Number(payload[0]?.value ?? 0).toLocaleString()}{" "}
        <span className="text-[11px] font-medium text-muted-foreground">
          calls
        </span>
      </p>
    </div>
  );
}

export function DailyCallsChart({ data, isLoading }: DailyCallsChartProps) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <DashboardCard title="Daily Calls" description="Call volume by time of day">
        <ChartSkeleton height={220} />
      </DashboardCard>
    );
  }

  if (data.length === 0) {
    return (
      <DashboardCard title="Daily Calls" description="Call volume by time of day">
        <EmptyState
          icon={BarChart3}
          title="No calls recorded"
          description="Daily call volume will appear here once activity begins."
          compact
        />
      </DashboardCard>
    );
  }

  const total = data.reduce((acc, d) => acc + (Number(d.calls) || 0), 0);
  const peak = data.reduce(
    (max, d) => (Number(d.calls) > Number(max.calls) ? d : max),
    data[0]
  );
  const peakValue = Number(peak?.calls) || 0;

  return (
    <DashboardCard
      title="Call performance"
      description="Call volume by time of day"
      icon={BarChart3}
      className="bg-gradient-to-br from-violet-50/40 via-card to-sky-50/30 dark:from-violet-500/5 dark:via-card dark:to-sky-500/5"
      action={
        <div className="flex items-center gap-2">
          <div className="rounded-[6px] border border-violet-200/70 bg-violet-50 px-2.5 py-1.5 text-right dark:border-violet-500/25 dark:bg-violet-500/10">
            <p className="text-sm font-semibold tabular-nums leading-none text-violet-700 dark:text-violet-300">
              {total.toLocaleString()}
            </p>
            <p className="mt-1 text-[9px] font-medium text-violet-500/80">
              Total today
            </p>
          </div>
          <div className="hidden rounded-[6px] border border-cyan-200/70 bg-cyan-50 px-2.5 py-1.5 text-right sm:block dark:border-cyan-500/25 dark:bg-cyan-500/10">
            <p className="text-sm font-semibold tabular-nums leading-none text-cyan-700 dark:text-cyan-300">
              {peak?.label}
            </p>
            <p className="mt-1 text-[9px] font-medium text-cyan-600/80">
              Peak hour
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-[220px] w-full flex-1">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              barCategoryGap="22%"
            >
              <defs>
                {BAR_PALETTE.map((c, i) => (
                  <linearGradient
                    key={i}
                    id={`dailyBarGrad-${i}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={c.solid} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={c.soft} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="4 6"
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.45}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                content={<CallsTooltip />}
                cursor={{ fill: "rgba(139, 92, 246, 0.06)", radius: 6 }}
              />
              <Bar
                dataKey="calls"
                radius={[6, 6, 6, 6]}
                maxBarSize={36}
                animationDuration={700}
              >
                {data.map((entry, index) => {
                  const isPeak = Number(entry.calls) === peakValue;
                  const palette = BAR_PALETTE[index % BAR_PALETTE.length];
                  return (
                    <Cell
                      key={entry.label}
                      fill={`url(#dailyBarGrad-${index % BAR_PALETTE.length})`}
                      stroke={isPeak ? palette.solid : "transparent"}
                      strokeWidth={isPeak ? 1.5 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}
