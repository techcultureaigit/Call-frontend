"use client";

import { useMemo, useState } from "react";
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
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AnalyticsBadge,
  AnalyticsCard,
} from "@/modules/reports/analytics-card";
import { Select } from "@/components/ui/select";
import {
  aggregateCallsOverTime,
  type ChartGranularity,
} from "@/modules/reports/analytics-chart-utils";
import type { ChartDataPoint } from "@/types/dashboard";

const BAR_PALETTE = [
  { solid: "#34d399", soft: "#d1fae5" },
  { solid: "#a78bfa", soft: "#ede9fe" },
  { solid: "#22d3ee", soft: "#cffafe" },
  { solid: "#818cf8", soft: "#e0e7ff" },
  { solid: "#f472b6", soft: "#fce7f3" },
  { solid: "#38bdf8", soft: "#e0f2fe" },
];

const CHART_HEIGHT = 152;

function formatDayLabel(raw: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  }
  return raw;
}

function CallsTooltip({
  active,
  payload,
  label,
  metricLabel = "calls",
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
  metricLabel?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] border border-violet-200/80 bg-white/95 px-3 py-2 shadow-elevated backdrop-blur-sm dark:border-violet-500/30 dark:bg-card/95">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
        {Number(payload[0]?.value ?? 0).toLocaleString()} {metricLabel}
      </p>
    </div>
  );
}

export function useBarChartStats(data: ChartDataPoint[]) {
  return useMemo(() => {
    const rows = data.map((row) => ({
      label: formatDayLabel(String(row.label || "")),
      calls: Number(row.calls ?? row.value ?? 0),
    }));
    const total = rows.reduce((acc, d) => acc + d.calls, 0);
    const peak = rows.reduce(
      (max, d) => (d.calls > max.calls ? d : max),
      rows[0] ?? { label: "—", calls: 0 }
    );
    return { rows, total, peak, peakValue: peak?.calls ?? 0 };
  }, [data]);
}

export function ReportCallPerformanceBars({
  data,
  isLoading,
  description,
  metricLabel = "calls",
}: {
  data: ChartDataPoint[];
  isLoading?: boolean;
  description?: string;
  metricLabel?: string;
}) {
  const mounted = useMounted();
  const [granularity, setGranularity] = useState<ChartGranularity>("daily");

  const chartSource = useMemo(
    () => aggregateCallsOverTime(data, granularity),
    [data, granularity]
  );

  const { rows: chartRows, total, peakValue } = useBarChartStats(chartSource);

  if (isLoading) {
    return (
      <AnalyticsCard
        title="Call performance"
        description="Daily volume"
        icon={BarChart3}
        accent="violet"
      >
        <ChartSkeleton height={CHART_HEIGHT} />
      </AnalyticsCard>
    );
  }

  if (!chartRows.length) {
    return (
      <AnalyticsCard
        title="Call performance"
        description="Daily volume"
        icon={BarChart3}
        accent="violet"
      >
        <EmptyState
          icon={BarChart3}
          title="No call data"
          description="Adjust filters to see performance."
        />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Call performance"
      description={
        description ??
        (granularity === "daily"
          ? "Daily volume across the selected period"
          : granularity === "weekly"
            ? "Weekly volume across the selected period"
            : "Monthly volume across the selected period")
      }
      icon={BarChart3}
      accent="violet"
      action={
        <div className="flex items-center gap-2">
          <Select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as ChartGranularity)}
            options={[
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
            ]}
            className="h-8 w-[92px] text-xs"
          />
          <AnalyticsBadge
            value={total.toLocaleString()}
            label="Total"
            tone="violet"
          />
        </div>
      }
    >
      <div className="h-[152px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartRows}
              margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
              barCategoryGap="20%"
            >
              <defs>
                {BAR_PALETTE.map((c, i) => (
                  <linearGradient
                    key={i}
                    id={`reportBarGrad-${i}`}
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
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                dy={6}
                minTickGap={14}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                content={<CallsTooltip metricLabel={metricLabel} />}
                cursor={{ fill: "rgba(139, 92, 246, 0.07)", radius: 6 }}
              />
              <Bar dataKey="calls" radius={[6, 6, 0, 0]} maxBarSize={32}>
                {chartRows.map((entry, index) => {
                  const isPeak = entry.calls === peakValue && peakValue > 0;
                  const palette = BAR_PALETTE[index % BAR_PALETTE.length];
                  return (
                    <Cell
                      key={`${entry.label}-${index}`}
                      fill={`url(#reportBarGrad-${index % BAR_PALETTE.length})`}
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
    </AnalyticsCard>
  );
}
