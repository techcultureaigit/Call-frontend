"use client";

import { useMemo } from "react";
import { Grid3X3 } from "lucide-react";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { AnalyticsCard } from "@/modules/reports/analytics-card";
import { cn } from "@/lib/utils";
import type { AnalyticsHeatmap } from "@/types/reports";

export function ReportHeatmap({
  data,
  isLoading,
}: {
  data?: AnalyticsHeatmap | null;
  isLoading?: boolean;
}) {
  const max = data?.max || 1;

  const grid = useMemo(() => {
    if (!data) return [];
    return data.days.map((day, dayIndex) =>
      data.hours.map((hourLabel, hourIndex) => {
        const cell = data.cells.find(
          (c) => c.dayIndex === dayIndex && c.hourIndex === hourIndex
        );
        return { day, hourLabel, value: cell?.value ?? 0 };
      })
    );
  }, [data]);

  if (isLoading) {
    return (
      <AnalyticsCard
        title="Peak hours"
        description="Activity by day & hour"
        icon={Grid3X3}
        accent="violet"
      >
        <ChartSkeleton height={120} />
      </AnalyticsCard>
    );
  }

  if (!data || !grid.length) {
    return (
      <AnalyticsCard title="Peak hours" description="Activity by day & hour" icon={Grid3X3} accent="violet">
        <p className="py-4 text-center text-xs text-muted-foreground">
          No heatmap data
        </p>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Peak hours"
      description="Activity by day & hour"
      icon={Grid3X3}
      accent="violet"
    >
      <div className="overflow-x-auto">
        <div
          className="mb-2 grid gap-1"
          style={{
            gridTemplateColumns: `32px repeat(${data.hours.length}, minmax(0, 1fr))`,
          }}
        >
          <div />
          {data.hours.map((h) => (
            <div
              key={h}
              className="text-center text-[10px] font-medium text-muted-foreground"
            >
              {h}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {grid.map((row, dayIndex) => (
            <div
              key={data.days[dayIndex]}
              className="grid gap-1"
              style={{
                gridTemplateColumns: `32px repeat(${data.hours.length}, minmax(0, 1fr))`,
              }}
            >
              <div className="flex items-center text-[11px] font-medium text-muted-foreground">
                {data.days[dayIndex]}
              </div>
              {row.map((cell) => {
                const intensity = cell.value / max;
                return (
                  <div
                    key={`${cell.day}-${cell.hourLabel}`}
                    title={`${cell.day} ${cell.hourLabel}: ${cell.value} calls`}
                    className={cn(
                      "h-3 rounded-[4px] border border-transparent",
                      cell.value === 0 && "border-border/40 bg-muted/40"
                    )}
                    style={
                      cell.value > 0
                        ? {
                            backgroundColor: `color-mix(in oklch, var(--brand) ${Math.round(
                              18 + intensity * 70
                            )}%, transparent)`,
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
          <span>Low</span>
          <div className="flex gap-1">
            {[0.2, 0.4, 0.6, 0.8, 1].map((v) => (
              <span
                key={v}
                className="size-2.5 rounded-[3px]"
                style={{
                  backgroundColor: `color-mix(in oklch, var(--brand) ${Math.round(
                    18 + v * 70
                  )}%, transparent)`,
                }}
              />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>
    </AnalyticsCard>
  );
}
