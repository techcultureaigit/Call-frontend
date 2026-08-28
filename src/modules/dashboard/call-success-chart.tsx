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
    <div className="rounded-[6px] border border-border/60 bg-card/95 px-3 py-2 shadow-elevated backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2c3b59]">
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

  return (
    <DashboardCard
      title="Call Success Rate"
      description="Weekly performance trend"
      icon={TrendingUp}
      className="bg-card"
      action={
        <div className="rounded-[6px] border border-[#2c3b59]/15 bg-[#2c3b59]/6 px-2.5 py-1.5 text-right">
          <p className="text-sm font-semibold tabular-nums leading-none text-[#2c3b59]">
            {avg}%
          </p>
          <p className="mt-1 text-[9px] font-medium text-muted-foreground">
            Weekly avg
          </p>
        </div>
      }
    >
      <div className="min-h-[220px] w-full flex-1">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="successArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2c3b59" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2c3b59" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 6"
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.45}
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
                domain={[0, 100]}
              />
              <Tooltip content={<SuccessTooltip />} />
              <Area
                type="monotone"
                dataKey="success"
                stroke="#2c3b59"
                strokeWidth={2}
                fill="url(#successArea)"
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}
