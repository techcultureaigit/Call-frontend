"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useMounted } from "@/hooks";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ChartSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { ReportPieSlice } from "@/types/reports";

export function ReportPieChart({
  data,
  title,
  description,
  isLoading,
}: {
  data: ReportPieSlice[];
  title: string;
  description: string;
  isLoading?: boolean;
}) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <DashboardCard title={title} description={description}>
        <ChartSkeleton height={220} />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title={title} description={description}>
      <div className="h-[200px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v: number, name: string) => [`${v}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-2 space-y-1.5">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
            <span className="truncate text-xs text-muted-foreground">{item.name}</span>
            <span className="ml-auto text-xs font-medium tabular-nums">{item.value}%</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
