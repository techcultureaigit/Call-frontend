"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useMounted } from "@/hooks";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { AnalyticsCard } from "@/modules/reports/analytics-card";
import type { ChartDataPoint } from "@/types/dashboard";

function formatDayLabel(raw: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  }
  return raw;
}

export function ReportAreaChart({
  data,
  isLoading,
}: {
  data: ChartDataPoint[];
  isLoading?: boolean;
}) {
  const mounted = useMounted();
  const chartData = data.map((row) => ({
    ...row,
    label: formatDayLabel(row.label),
    success: row.success ?? row.value ?? 0,
  }));

  if (isLoading) {
    return (
      <AnalyticsCard
        title="Completion trend"
        description="Daily survey completion rate"
        icon={TrendingUp}
      >
        <ChartSkeleton height={200} />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Completion trend"
      description="Daily survey completion rate"
      icon={TrendingUp}
      contentClassName="pt-1"
    >
      <div className="h-[200px] w-full">
        {mounted && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reportSuccessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2c3b59" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2c3b59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v: number) => [`${v}%`, "Completion"]}
              />
              <Area type="monotone" dataKey="success" stroke="#2c3b59" strokeWidth={2} fill="url(#reportSuccessGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No completion trend data
          </p>
        )}
      </div>
    </AnalyticsCard>
  );
}
