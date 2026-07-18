"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { useMounted } from "@/hooks";
import { ChartSkeleton } from "./dashboard-skeleton";
import { DashboardCard } from "./dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { CampaignDistribution } from "@/types/dashboard";

interface CampaignPieChartProps {
  data: CampaignDistribution[];
  isLoading?: boolean;
}

export function CampaignPieChart({ data, isLoading }: CampaignPieChartProps) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <DashboardCard title="Campaign Distribution" description="By campaign type">
        <ChartSkeleton height={280} />
      </DashboardCard>
    );
  }

  if (data.length === 0) {
    return (
      <DashboardCard title="Campaign Distribution" description="By campaign type">
        <EmptyState
          icon={PieChartIcon}
          title="No campaigns yet"
          description="Distribution chart will populate when campaigns are created."
          compact
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Campaign Distribution"
      description="By campaign type"
      icon={PieChartIcon}
    >
      <div className="relative h-[220px] w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={85}
                paddingAngle={3}
                cornerRadius={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "var(--shadow-elevated)",
                }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {data.length}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Types
          </span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="truncate text-xs text-muted-foreground">
              {item.name}
            </span>
            <span className="ml-auto text-xs font-medium tabular-nums">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
