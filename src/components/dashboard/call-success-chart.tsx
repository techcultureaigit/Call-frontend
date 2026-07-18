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
import { useMounted } from "@/hooks";
import { ChartSkeleton } from "./dashboard-skeleton";
import { DashboardCard } from "./dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import { TrendingUp } from "lucide-react";
import type { ChartDataPoint } from "@/types/dashboard";

interface CallSuccessChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
}

export function CallSuccessChart({ data, isLoading }: CallSuccessChartProps) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <DashboardCard title="Call Success Rate" description="Weekly performance trend">
        <ChartSkeleton height={280} />
      </DashboardCard>
    );
  }

  if (data.length === 0) {
    return (
      <DashboardCard title="Call Success Rate" description="Weekly performance trend">
        <EmptyState
          icon={TrendingUp}
          title="No call data yet"
          description="Success rate trends will appear once calls are logged."
          compact
        />
      </DashboardCard>
    );
  }

  const values = data.map((d) => Number(d.success) || 0);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const best = Math.max(...values);

  return (
    <DashboardCard
      title="Call Success Rate"
      description="Weekly performance trend"
      icon={TrendingUp}
      action={
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-lg font-semibold tabular-nums leading-none text-foreground">
              {avg}%
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">Average</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-lg font-semibold tabular-nums leading-none text-emerald-600 dark:text-emerald-400">
              {best}%
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">Best day</p>
          </div>
        </div>
      }
    >
      <div className="h-[280px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.5}
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
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "var(--shadow-elevated)",
                }}
                formatter={(value: number) => [`${value}%`, "Success Rate"]}
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="success"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                fill="url(#successGradient)"
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  stroke: "var(--card)",
                  fill: "var(--chart-2)",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}
