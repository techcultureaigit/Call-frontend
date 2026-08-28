"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

/** Monochrome navy only — peak is darker navy, not blue */
const BAR_DEFAULT = "#2c3b59";
const BAR_PEAK = "#1a2233";

function CallsTooltip({
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
        {Number(payload[0]?.value ?? 0).toLocaleString()}{" "}
        <span className="text-[11px] font-medium text-muted-foreground">
          calls
        </span>
      </p>
    </div>
  );
}

export function DailyCallsChart({ data, isLoading }: DailyCallsChartProps) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <DashboardCard title="Daily Calls" description="Call volume by time of day">
        <ChartSkeleton height={220} />
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
  const peakValue = Number(peak?.calls) || 0;

  return (
    <DashboardCard
      title="Call performance"
      description="Call volume by time of day"
      icon={BarChart3}
      className="bg-card"
      action={
        <div className="flex items-center gap-2">
          <div className="rounded-[6px] border border-[#2c3b59]/15 bg-[#2c3b59]/6 px-2.5 py-1.5 text-right">
            <p className="text-sm font-semibold tabular-nums leading-none text-[#2c3b59]">
              {total.toLocaleString()}
            </p>
            <p className="mt-1 text-[9px] font-medium text-muted-foreground">
              Total today
            </p>
          </div>
          <div className="hidden rounded-[6px] border border-[#2c3b59]/15 bg-[#2c3b59]/6 px-2.5 py-1.5 text-right sm:block">
            <p className="text-sm font-semibold tabular-nums leading-none text-[#2c3b59]">
              {peak?.label}
            </p>
            <p className="mt-1 text-[9px] font-medium text-muted-foreground">
              Peak hour
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-[220px] w-full flex-1">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              barCategoryGap="22%"
            >
              <defs>
                <linearGradient id="dailyBarDefault" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BAR_DEFAULT} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={BAR_DEFAULT} stopOpacity={0.45} />
                </linearGradient>
                <linearGradient id="dailyBarPeak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BAR_PEAK} stopOpacity={1} />
                  <stop offset="100%" stopColor={BAR_DEFAULT} stopOpacity={0.8} />
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
              />
              <Tooltip
                content={<CallsTooltip />}
                cursor={{ fill: "rgba(44, 59, 89, 0.06)", radius: 6 }}
              />
              <Bar
                dataKey="calls"
                radius={[6, 6, 6, 6]}
                maxBarSize={36}
                animationDuration={700}
              >
                {data.map((entry) => {
                  const isPeak = Number(entry.calls) === peakValue;
                  return (
                    <Cell
                      key={entry.label}
                      fill={isPeak ? "url(#dailyBarPeak)" : "url(#dailyBarDefault)"}
                      stroke={isPeak ? BAR_PEAK : "transparent"}
                      strokeWidth={isPeak ? 1.5 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}
