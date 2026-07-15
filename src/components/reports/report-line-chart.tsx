"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useMounted } from "@/hooks";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ChartSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { ChartDataPoint } from "@/types/dashboard";

export function ReportLineChart({
  data,
  isLoading,
}: {
  data: ChartDataPoint[];
  isLoading?: boolean;
}) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <DashboardCard title="Call Volume Trend" description="Daily calls over selected period">
        <ChartSkeleton height={280} />
      </DashboardCard>
    );
  }

  if (data.length === 0) {
    return (
      <DashboardCard title="Call Volume Trend" description="Daily calls over selected period">
        <EmptyState icon={TrendingUp} title="No data" description="Adjust filters to see trends." compact />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Call Volume Trend" description="Daily calls — Line chart">
      <div className="h-[280px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v: number) => [v, "Calls"]}
              />
              <Line type="monotone" dataKey="calls" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--chart-1)" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}
