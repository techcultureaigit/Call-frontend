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

  return (
    <DashboardCard
      title="Call Success Rate"
      description="Weekly performance trend"
    >
      <div className="h-[280px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
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
                }}
                formatter={(value: number) => [`${value}%`, "Success Rate"]}
              />
              <Area
                type="monotone"
                dataKey="success"
                stroke="var(--chart-2)"
                strokeWidth={2}
                fill="url(#successGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}
