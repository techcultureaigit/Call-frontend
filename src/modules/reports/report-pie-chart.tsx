"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChartIcon } from "lucide-react";
import { useMemo } from "react";
import { useMounted } from "@/hooks";
import { AnalyticsCard } from "./analytics-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReportPieSlice } from "@/types/reports";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  fontSize: "12px",
  boxShadow: "var(--shadow-elevated)",
};

export function ReportPieChart({
  data,
  title,
  description,
  isLoading,
  valueSuffix = "%",
  showCount = false,
  accent = "teal",
}: {
  data: ReportPieSlice[];
  title: string;
  description: string;
  isLoading?: boolean;
  valueSuffix?: string;
  showCount?: boolean;
  accent?: "brand" | "teal" | "amber" | "rose" | "violet";
}) {
  const mounted = useMounted();

  const centerLabel = useMemo(() => {
    if (!data.length) return null;
    const top = [...data].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))[0];
    return top;
  }, [data]);

  if (isLoading) {
    return (
      <AnalyticsCard title={title} description={description}>
        <Skeleton className="h-[200px] w-full rounded-[4px]" />
      </AnalyticsCard>
    );
  }

  if (!data.length) {
    return (
      <AnalyticsCard
        title={title}
        description={description}
        icon={PieChartIcon}
      >
        <p className="py-12 text-center text-sm text-muted-foreground">
          No data available
        </p>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title={title}
      description={description}
      icon={PieChartIcon}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative h-[130px] w-[130px] shrink-0">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number, name: string, item) => {
                    const count = (item?.payload as ReportPieSlice | undefined)
                      ?.count;
                    if (showCount && count != null) {
                      return [`${count} (${v}${valueSuffix})`, name];
                    }
                    return [`${v}${valueSuffix}`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {centerLabel ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-semibold tabular-nums text-foreground">
                {centerLabel.count ?? centerLabel.value}
              </span>
              <span className="max-w-[72px] truncate text-[9px] text-muted-foreground">
                {centerLabel.name}
              </span>
            </div>
          ) : null}
        </div>
        <div className="w-full min-w-0 flex-1 space-y-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 rounded-[4px] bg-muted/25 px-2 py-1.5"
            >
              <span
                className="size-2.5 shrink-0 rounded-full ring-2 ring-background"
                style={{ backgroundColor: item.fill }}
              />
              <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                {item.name}
              </span>
              <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                {showCount && item.count != null ? (
                  <>
                    <span className="text-foreground">{item.count}</span>
                    <span className="mx-1 opacity-40">·</span>
                    {item.value}
                    {valueSuffix}
                  </>
                ) : (
                  <>
                    {item.value}
                    {valueSuffix}
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AnalyticsCard>
  );
}
