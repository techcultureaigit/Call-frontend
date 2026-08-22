"use client";

import { PhoneOff } from "lucide-react";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { AnalyticsCard } from "@/modules/reports/analytics-card";
import type { ReportPieSlice } from "@/types/reports";

const COLORS = ["var(--brand)", "#34d399", "#a78bfa", "#fb923c"];

export function ReportHangupBars({
  data,
  isLoading,
}: {
  data: ReportPieSlice[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Hangup causes" description="Top disconnect reasons" icon={PhoneOff} accent="amber">
        <ChartSkeleton height={120} />
      </AnalyticsCard>
    );
  }

  if (!data.length) {
    return (
      <AnalyticsCard title="Hangup causes" description="Top disconnect reasons" icon={PhoneOff} accent="amber">
        <p className="py-4 text-center text-xs text-muted-foreground">
          No hangup data
        </p>
      </AnalyticsCard>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <AnalyticsCard title="Hangup causes" description="Top disconnect reasons" icon={PhoneOff} accent="amber">
      <div className="w-full space-y-2.5">
        {data.slice(0, 3).map((row, i) => (
          <div key={row.name}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-xs font-medium text-foreground">
                {row.name}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {row.count ?? 0}
                </span>
                {" · "}
                {row.value}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(row.value / max) * 100}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}
