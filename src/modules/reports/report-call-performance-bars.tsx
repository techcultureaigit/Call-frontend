"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
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

const CHART_HEIGHT = 200;

function formatDayLabel(raw: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  }
  return raw;
}

function PerformanceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] border border-border/60 bg-popover px-3 py-2 shadow-elevated">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 space-y-0.5">
        {payload.map((p) => (
          <p
            key={String(p.dataKey)}
            className="text-xs font-medium tabular-nums text-foreground"
          >
            <span
              className="mr-1.5 inline-block size-1.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            {p.dataKey}: {Number(p.value ?? 0).toLocaleString()}
          </p>
        ))}
      </div>
    </div>
  );
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

  const { rows, total, connected, missed, peak, avg } = useMemo(() => {
    const mapped = chartSource.map((row) => {
      const c = Number(row.connected ?? 0);
      const m = Number(row.missed ?? 0);
      const calls = Number(row.calls ?? row.value ?? c + m);
      return {
        label: formatDayLabel(String(row.label || "")),
        calls,
        connected: c,
        missed: m,
      };
    });
    const totalCalls = mapped.reduce((s, r) => s + r.calls, 0);
    const totalConnected = mapped.reduce((s, r) => s + r.connected, 0);
    const totalMissed = mapped.reduce((s, r) => s + r.missed, 0);
    const peakRow = mapped.reduce(
      (max, r) => (r.calls > max.calls ? r : max),
      mapped[0] ?? { label: "—", calls: 0, connected: 0, missed: 0 }
    );
    const avgCalls = mapped.length
      ? Math.round((totalCalls / mapped.length) * 10) / 10
      : 0;
    return {
      rows: mapped,
      total: totalCalls,
      connected: totalConnected,
      missed: totalMissed,
      peak: peakRow,
      avg: avgCalls,
    };
  }, [chartSource]);

  const connectRate = total ? Math.round((connected / total) * 1000) / 10 : 0;

  if (isLoading) {
    return (
      <AnalyticsCard
        title="Call performance"
        description="Volume & outcomes by day"
        icon={BarChart3}
      >
        <ChartSkeleton height={CHART_HEIGHT} />
      </AnalyticsCard>
    );
  }

  if (!rows.length) {
    return (
      <AnalyticsCard
        title="Call performance"
        description="Volume & outcomes by day"
        icon={BarChart3}
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
          ? "Daily volume · connected vs missed"
          : granularity === "weekly"
            ? "Weekly volume · connected vs missed"
            : "Monthly volume · connected vs missed")
      }
      icon={BarChart3}
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
      {/* Summary strip */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-[6px] border border-border/50 bg-muted/15 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Connected
          </p>
          <p className="font-display mt-0.5 text-base font-semibold tabular-nums text-emerald-600">
            {connected.toLocaleString()}
          </p>
        </div>
        <div className="rounded-[6px] border border-border/50 bg-muted/15 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Missed
          </p>
          <p className="font-display mt-0.5 text-base font-semibold tabular-nums text-sky-600">
            {missed.toLocaleString()}
          </p>
        </div>
        <div className="rounded-[6px] border border-border/50 bg-muted/15 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Connect rate
          </p>
          <p className="font-display mt-0.5 flex items-center gap-1 text-base font-semibold tabular-nums text-foreground">
            <TrendingUp className="size-3.5 text-emerald-500" />
            {connectRate}%
          </p>
        </div>
        <div className="rounded-[6px] border border-border/50 bg-muted/15 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Peak · Avg
          </p>
          <p className="font-display mt-0.5 text-base font-semibold tabular-nums text-foreground">
            {peak.calls}
            <span className="text-xs font-normal text-muted-foreground">
              {" "}
              · {avg}/{metricLabel === "calls" ? "day" : "period"}
            </span>
          </p>
          <p className="truncate text-[10px] text-muted-foreground" title={peak.label}>
            Peak: {peak.label}
          </p>
        </div>
      </div>

      <div className="h-[200px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
              barCategoryGap="18%"
            >
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
              <Tooltip content={<PerformanceTooltip />} cursor={{ fill: "rgba(139, 92, 246, 0.06)", radius: 6 }} />
              <Legend
                verticalAlign="top"
                height={28}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar
                dataKey="connected"
                name="Connected"
                stackId="a"
                fill="#34d399"
                radius={[0, 0, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="missed"
                name="Missed"
                stackId="a"
                fill="#38bdf8"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </AnalyticsCard>
  );
}
