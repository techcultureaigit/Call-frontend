"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
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

export function DailyCallsChart({ data, isLoading }: DailyCallsChartProps) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <DashboardCard title="Daily Calls" description="Call volume by time of day">
        <ChartSkeleton height={280} />
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

  return (
    <DashboardCard
      title="Daily Calls"
      description="Call volume by time of day"
      icon={BarChart3}
      action={
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-lg font-semibold tabular-nums leading-none text-foreground">
              {total.toLocaleString()}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">Total today</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-lg font-semibold tabular-nums leading-none text-foreground">
              {peak?.label}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">Peak hour</p>
          </div>
        </div>
      }
    >
      <div className="h-[280px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dailyCallsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.4} />
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "var(--shadow-elevated)",
                }}
                formatter={(value: number) => [value, "Calls"]}
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              />
              <Bar
                dataKey="calls"
                fill="url(#dailyCallsGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}
