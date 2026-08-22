"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CheckCircle2,
  CircleDashed,
  PhoneMissed,
  PhoneOff,
  PieChart as PieChartIcon,
  type LucideIcon,
} from "lucide-react";
import { useMounted } from "@/hooks";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AnalyticsBadge,
  AnalyticsCard,
} from "@/modules/reports/analytics-card";
import { cn } from "@/lib/utils";
import type { ReportPieSlice } from "@/types/reports";

type SliceStyle = {
  fill: string;
  soft: string;
  border: string;
  text: string;
  icon: LucideIcon;
};

const CALL_STYLE: Record<string, SliceStyle> = {
  Connected: {
    fill: "#34d399",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200/70 dark:border-emerald-500/25",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  Disconnected: {
    fill: "#fb923c",
    soft: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200/70 dark:border-amber-500/25",
    text: "text-amber-700 dark:text-amber-300",
    icon: PhoneOff,
  },
  Missed: {
    fill: "#38bdf8",
    soft: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200/70 dark:border-sky-500/25",
    text: "text-sky-700 dark:text-sky-300",
    icon: PhoneMissed,
  },
};

const SURVEY_STYLE: Record<string, SliceStyle> = {
  Complete: {
    fill: "#34d399",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200/70 dark:border-emerald-500/25",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  Incomplete: {
    fill: "#fb923c",
    soft: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200/70 dark:border-amber-500/25",
    text: "text-amber-700 dark:text-amber-300",
    icon: CircleDashed,
  },
  Missed: {
    fill: "#f472b6",
    soft: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200/70 dark:border-rose-500/25",
    text: "text-rose-700 dark:text-rose-300",
    icon: PhoneMissed,
  },
};

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: ReportPieSlice }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-[6px] border border-border/60 bg-popover px-3 py-2 shadow-elevated">
      <p className="text-xs font-semibold">{payload[0]?.name}</p>
      <p className="text-xs tabular-nums text-muted-foreground">
        {row?.count ?? 0} · {payload[0]?.value}%
      </p>
    </div>
  );
}

export function ReportDashboardDonut({
  data,
  isLoading,
  variant = "call",
}: {
  data: ReportPieSlice[];
  isLoading?: boolean;
  variant?: "call" | "survey";
}) {
  const mounted = useMounted();
  const styleMap = variant === "survey" ? SURVEY_STYLE : CALL_STYLE;
  const total = data.reduce((sum, d) => sum + (d.count ?? 0), 0);
  const styled = data.map((d) => ({
    ...d,
    fill: styleMap[d.name]?.fill ?? d.fill,
  }));

  const centerSlice =
    variant === "call"
      ? data.find((d) => d.name === "Connected")
      : [...data].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))[0];
  const centerPct = centerSlice?.value ?? 0;
  const centerLabel =
    variant === "call" ? "Connected" : (centerSlice?.name ?? "Status");

  const title = variant === "call" ? "Call outcomes" : "Survey status";
  const description =
    variant === "call"
      ? "Connected · Disconnected · Missed"
      : "Complete · Incomplete · Missed";
  const accent = variant === "call" ? "emerald" : "amber";

  if (isLoading) {
    return (
      <AnalyticsCard title={title} description={description} icon={PieChartIcon} accent={accent}>
        <ChartSkeleton height={152} />
      </AnalyticsCard>
    );
  }

  if (!data.length || total === 0) {
    return (
      <AnalyticsCard title={title} description={description} icon={PieChartIcon} accent={accent}>
        <EmptyState icon={PieChartIcon} title="No data" description="Awaiting call activity." />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title={title}
      description={description}
      icon={PieChartIcon}
      accent={accent}
      action={
        <AnalyticsBadge value={total.toLocaleString()} label="Total" tone="violet" />
      }
    >
      <div className="flex w-full items-center justify-center gap-4 py-1">
        <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={styled}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={48}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="var(--card)"
                  cornerRadius={3}
                >
                  {styled.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-1">
            <p className="font-display text-sm font-semibold tabular-nums leading-none">
              {centerPct}%
            </p>
            <p className="mt-0.5 max-w-[54px] text-center text-[7px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground">
              {centerLabel}
            </p>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-2">
          {styled.map((item) => {
            const style = styleMap[item.name];
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span
                      className={cn(
                        "truncate text-xs font-medium",
                        style?.text
                      )}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span className="font-display shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    {item.value}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AnalyticsCard>
  );
}
