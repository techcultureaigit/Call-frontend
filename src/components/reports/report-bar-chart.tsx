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
import { useMounted } from "@/hooks";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ChartSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { ChartDataPoint } from "@/types/dashboard";

export function ReportBarChart({
  data,
  isLoading,
}: {
  data: ChartDataPoint[];
  isLoading?: boolean;
}) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <DashboardCard title="Responses by Campaign" description="Survey responses per campaign">
        <ChartSkeleton height={280} />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Responses by Campaign" description="Survey responses — Bar chart">
      <div className="h-[280px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} dy={8} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v: number) => [v, "Responses"]}
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              />
              <Bar dataKey="responses" fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}
