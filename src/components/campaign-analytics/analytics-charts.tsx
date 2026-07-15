"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMounted } from "@/hooks";
import { ChartSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { BarChart3, PieChart as PieIcon } from "lucide-react";
import { AnalyticsCard } from "./analytics-card";
import type { ChartDataPoint } from "@/types/dashboard";
import type { ReportPieSlice } from "@/types/reports";

function ChartWrapper({
  children,
  height = 280,
}: {
  children: React.ReactNode;
  height?: number;
}) {
  const mounted = useMounted();
  return (
    <div style={{ height }} className="w-full">
      {mounted ? children : null}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
};

export function PerformanceLineChart({
  data,
  isLoading,
  compareEnabled,
}: {
  data: ChartDataPoint[];
  isLoading?: boolean;
  compareEnabled?: boolean;
}) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Campaign Performance" description="Success rate over time" gradient="from-violet-500/8 to-transparent">
        <ChartSkeleton height={280} />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Campaign Performance"
      description="Daily performance index — line chart"
      gradient="from-violet-500/8 to-transparent"
    >
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="current" name="Current" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
            {compareEnabled && (
              <Line type="monotone" dataKey="prior" name="Prior Period" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="6 4" dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </AnalyticsCard>
  );
}

export function DailyCallsBarChart({
  data,
  isLoading,
}: {
  data: ChartDataPoint[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Daily Calls" description="Call volume by day">
        <ChartSkeleton height={280} />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard title="Daily Calls" description="Outbound call volume — bar chart" gradient="from-blue-500/8 to-transparent">
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "Calls"]} />
            <Bar dataKey="calls" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </AnalyticsCard>
  );
}

export function CallStatusPieChart({
  data,
  isLoading,
}: {
  data: ReportPieSlice[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Call Status" description="Distribution by outcome">
        <ChartSkeleton height={280} />
      </AnalyticsCard>
    );
  }

  if (data.length === 0) {
    return (
      <AnalyticsCard title="Call Status" description="Distribution by outcome">
        <EmptyState icon={PieIcon} title="No data" compact />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard title="Call Status" description="Completed, failed, pending — pie chart" gradient="from-emerald-500/8 to-transparent">
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </AnalyticsCard>
  );
}

export function SuccessRateAreaChart({
  data,
  isLoading,
}: {
  data: ChartDataPoint[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Success Rate Trend" description="Rolling success percentage">
        <ChartSkeleton height={240} />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard title="Success Rate Trend" description="Area chart — success % over period" gradient="from-emerald-500/8 to-transparent">
      <ChartWrapper height={240}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} domain={[60, 100]} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`, "Success"]} />
            <Area type="monotone" dataKey="success" stroke="var(--chart-2)" fill="url(#successGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </AnalyticsCard>
  );
}

export function CampaignComparisonChart({
  data,
  isLoading,
}: {
  data: ChartDataPoint[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Campaign Comparison" description="Side-by-side performance">
        <ChartSkeleton height={280} />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard title="Campaign Comparison" description="Success vs response rate by campaign" gradient="from-amber-500/8 to-transparent">
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="success" name="Success %" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="responses" name="Response %" fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </AnalyticsCard>
  );
}

export function ResponseRateTrendChart({
  data,
  isLoading,
}: {
  data: ChartDataPoint[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Response Rate Trend" description="Survey response rate over time">
        <ChartSkeleton height={240} />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard title="Response Rate Trend" description="Daily response rate %" gradient="from-fuchsia-500/8 to-transparent">
      <ChartWrapper height={240}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`, "Response Rate"]} />
            <Line type="monotone" dataKey="rate" stroke="var(--chart-4)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </AnalyticsCard>
  );
}

export function LanguageDistributionChart({
  data,
  isLoading,
}: {
  data: ReportPieSlice[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Language Distribution" description="Calls by language">
        <ChartSkeleton height={240} />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard title="Language Distribution" description="Multi-language campaign reach" gradient="from-cyan-500/8 to-transparent">
      <ChartWrapper height={240}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Share"]} />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </AnalyticsCard>
  );
}

export function EngagementHeatmap({
  data,
  isLoading,
}: {
  data: { day: string; hour: number; value: number }[];
  isLoading?: boolean;
}) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);
  const max = Math.max(...data.map((d) => d.value), 1);

  const getValue = (day: string, hour: number) =>
    data.find((d) => d.day === day && d.hour === hour)?.value ?? 0;

  if (isLoading) {
    return (
      <AnalyticsCard title="Customer Engagement" description="Activity heatmap by day & hour">
        <ChartSkeleton height={200} />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Customer Engagement"
      description="Call activity heatmap — darker = higher volume"
      gradient="from-indigo-500/8 to-transparent"
    >
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="mb-2 grid grid-cols-[40px_repeat(12,1fr)] gap-1">
            <div />
            {hours.map((h) => (
              <div key={h} className="text-center text-[9px] text-muted-foreground">
                {h}h
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day} className="mb-1 grid grid-cols-[40px_repeat(12,1fr)] gap-1">
              <div className="flex items-center text-[10px] font-medium text-muted-foreground">
                {day}
              </div>
              {hours.map((hour) => {
                const value = getValue(day, hour);
                const intensity = value / max;
                return (
                  <div
                    key={`${day}-${hour}`}
                    title={`${day} ${hour}:00 — ${value} calls`}
                    className="aspect-square rounded-md transition-transform hover:scale-110"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--chart-1) ${Math.round(intensity * 85 + 8)}%, transparent)`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </AnalyticsCard>
  );
}
