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

function SuccessTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] border border-emerald-200/80 bg-white/95 px-3 py-2 shadow-elevated backdrop-blur-sm dark:border-emerald-500/30 dark:bg-card/95">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
        {payload[0]?.value}%{" "}
        <span className="text-[11px] font-medium text-muted-foreground">
          success
        </span>
      </p>
    </div>
  );
}

export function CallSuccessChart({ data, isLoading }: CallSuccessChartProps) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <DashboardCard
        title="Call Success Rate"
        description="Weekly performance trend"
      >
        <ChartSkeleton height={220} />
      </DashboardCard>
    );
  }

  if (data.length === 0) {
    return (
      <DashboardCard
        title="Call Success Rate"
        description="Weekly performance trend"
      >
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

 
}
