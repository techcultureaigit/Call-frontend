"use client";

/**
 * Compact metric strip under main charts (mockup “Key Performance Summary”).
 */
import { Skeleton } from "@/components/ui/skeleton";
import type { ReportsData } from "@/types/reports";

export function AnalyticsMetricStrip({
  data,
  isLoading,
}: {
  data?: ReportsData | null;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-[6px]" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const total = data.calls?.total ?? 0;
  const items = [
    { label: "Total Calls", value: String(total) },
    { label: "Connected", value: String(data.calls?.connected ?? 0) },
    { label: "Disconnected", value: String(data.calls?.disconnected ?? 0) },
    { label: "Missed", value: String(data.calls?.missed ?? 0) },
    {
      label: "Survey Complete",
      value: data.survey?.counting ?? "0/0",
    },
    {
      label: "Incomplete Surveys",
      value: String(data.survey?.incomplete ?? 0),
    },
    {
      label: "Avg Duration",
      value: data.duration?.averageLabel ?? "—",
    },
    {
      label: "Recording Coverage",
      value: `${data.recording?.coverageRate ?? 0}%`,
    },
  ];

  return (
    <div>
      <p className="mb-3 text-sm font-semibold tracking-tight text-foreground">
        Key Performance Summary
      </p>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 xl:grid-cols-8">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[6px] border border-border/60 bg-card px-3 py-2.5 text-center shadow-card"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
