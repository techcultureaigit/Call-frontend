"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useMounted } from "@/hooks";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AnalyticsBadge,
  AnalyticsCard,
} from "@/modules/reports/analytics-card";
import type { ChartDataPoint } from "@/types/dashboard";
import type { AnalyticsTrendMode } from "@/modules/reports/analytics-kpi-filter";

const CHART_HEIGHT = 152;

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] border border-emerald-200/80 bg-white/95 px-3 py-2 shadow-elevated backdrop-blur-sm dark:border-emerald-500/30 dark:bg-card/95">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
        {label}
      </p>
      <div className="mt-1 space-y-0.5">
        {payload.map((row) => (
          <p key={row.name} className="text-xs tabular-nums text-foreground">
            {row.name}: {row.value}
          </p>
        ))}
      </div>
    </div>
  );
}

export function useTrendStats(data: ChartDataPoint[]) {
  return useMemo(() => {
    const totalCalls = data.reduce(
      (sum, row) => sum + Number(row.calls ?? 0),
      0
    );
    const connectedTotal = data.reduce(
      (sum, row) => sum + Number(row.connected ?? 0),
      0
    );
    const connectRate = totalCalls
      ? Math.round((connectedTotal / totalCalls) * 100)
      : 0;
    return { connectRate };
  }, [data]);
}

export function ReportHeroChart({
  data,
  isLoading,
  trendMode = "all",
  description,
}: {
  data: ChartDataPoint[];
  isLoading?: boolean;
  trendMode?: AnalyticsTrendMode;
  description?: string;
}) {
  const mounted = useMounted();

  const chartRows = useMemo(
    () =>
      data.map((row) => {
        const raw = String(row.label || "");
        let label = raw;
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          const d = new Date(`${raw}T12:00:00`);
          if (!Number.isNaN(d.getTime())) {
            label = d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }
        }
        return { ...row, label };
      }),
    [data]
  );

  const { connectRate } = useTrendStats(data);

  const badge =
    trendMode === "completion"
      ? (() => {
          const completeTotal = data.reduce(
            (sum, row) => sum + Number(row.complete ?? row.calls ?? 0),
            0
          );
          const totalAll = data.reduce(
            (sum, row) => sum + Number(row.total ?? 0),
            0
          );
          const rate = totalAll
            ? Math.round((completeTotal / totalAll) * 100)
            : 0;
          return { value: `${rate}%`, label: "Completion rate" };
        })()
      : trendMode === "missed"
        ? {
            value: String(
              data.reduce((sum, row) => sum + Number(row.missed ?? 0), 0)
            ),
            label: "Missed total",
          }
        : trendMode === "connected"
          ? {
              value: `${connectRate}%`,
              label: "Connect rate",
            }
          : {
              value: `${connectRate}%`,
              label: "Connect rate",
            };

  const showTotal = trendMode === "all" || trendMode === "completion";
  const showConnected = trendMode === "all" || trendMode === "connected";
  const showMissed = trendMode === "all" || trendMode === "missed";
  const areaKey = trendMode === "completion" ? "complete" : "calls";
  const areaName = trendMode === "completion" ? "Complete" : "Total";

  if (isLoading) {
    return (
      <AnalyticsCard
        title="Performance trend"
        description="Total · Connected · Missed"
        icon={TrendingUp}
        accent="emerald"
      >
        <ChartSkeleton height={CHART_HEIGHT} />
      </AnalyticsCard>
    );
  }

  if (!data.length) {
    return (
      <AnalyticsCard
        title="Performance trend"
        description="Total · Connected · Missed"
        icon={TrendingUp}
        accent="emerald"
      >
        <EmptyState
          icon={TrendingUp}
          title="No trend data"
          description="Trends appear once calls are logged."
        />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Performance trend"
      description={description ?? "Call outcomes over time"}
      icon={TrendingUp}
      accent="emerald"
      action={
        <AnalyticsBadge
          value={badge.value}
          label={badge.label}
          tone="emerald"
        />
      }
    >
      <div className="h-[152px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartRows}
              margin={{ top: 8, right: 4, left: -14, bottom: 0 }}
            >
              <defs>
                <linearGradient id="reportTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2983ad" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2983ad" stopOpacity={0.02} />
                </linearGradient>
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
                minTickGap={16}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={30}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Tooltip content={<TrendTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                height={22}
                wrapperStyle={{ fontSize: 11 }}
                iconSize={8}
              />
              {showTotal ? (
                <Area
                  type="monotone"
                  dataKey={areaKey}
                  name={areaName}
                  stroke="#2983ad"
                  strokeWidth={2}
                  fill="url(#reportTrendGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ) : null}
              {showConnected ? (
                <Line
                  type="monotone"
                  dataKey="connected"
                  name="Connected"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                />
              ) : null}
              {showMissed ? (
                <Line
                  type="monotone"
                  dataKey="missed"
                  name="Missed"
                  stroke="#f472b6"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </AnalyticsCard>
  );
}
