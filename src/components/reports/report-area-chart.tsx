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
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ChartSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { ChartDataPoint } from "@/types/dashboard";

export function ReportAreaChart({
  data,
  isLoading,
}: {
  data: ChartDataPoint[];
  isLoading?: boolean;
}) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <DashboardCard title="Success Rate Trend" description="Call success rate over time">
        <ChartSkeleton height={280} />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Success Rate Trend" description="Weekly performance — Area chart">
      <div className="h-[280px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reportSuccessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v: number) => [`${v}%`, "Success Rate"]}
              />
              <Area type="monotone" dataKey="success" stroke="var(--chart-2)" strokeWidth={2} fill="url(#reportSuccessGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}
