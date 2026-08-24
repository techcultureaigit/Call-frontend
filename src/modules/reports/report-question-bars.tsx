"use client";

import { HelpCircle } from "lucide-react";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { AnalyticsCard } from "@/modules/reports/analytics-card";
import { cn } from "@/lib/utils";
import type { AnalyticsQuestionBar } from "@/types/reports";

export function ReportQuestionBars({
  data,
  isLoading,
}: {
  data: AnalyticsQuestionBar[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <AnalyticsCard
        title="Survey responses"
        description="Question response breakdown"
        icon={HelpCircle}
        accent="brand"
      >
        <ChartSkeleton height={200} />
      </AnalyticsCard>
    );
  }

  if (!data.length) {
    return (
      <AnalyticsCard
        title="Survey responses"
        description="Question response breakdown"
        icon={HelpCircle}
        accent="brand"
      >
        <p className="py-8 text-center text-sm text-muted-foreground">
          No question data for this period
        </p>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Survey responses"
      description={`Question responses (${data.length})`}
      icon={HelpCircle}
      accent="brand"
      contentClassName="pt-2"
    >
      <div className="w-full overflow-hidden rounded-[6px] border border-border/50">
        <div className="grid grid-cols-[40px_1fr_72px_56px_minmax(100px,1fr)] gap-3 border-b border-border/50 bg-muted/30 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground max-lg:hidden">
          <span>#</span>
          <span>Question</span>
          <span className="text-right">Count</span>
          <span className="text-right">Rate</span>
          <span>Progress</span>
        </div>
        <div className="max-h-[200px] divide-y divide-border/40 overflow-y-auto">
          {data.map((row, index) => {
            const total = row.answered + row.unanswered;
            const pct = total ? Math.round((row.answered / total) * 100) : 0;
            const label = row.fullLabel || row.label;

            return (
              <div
                key={`${row.questionId ?? row.label}-${index}`}
                className={cn(
                  "grid gap-3 px-3 py-2.5 max-lg:grid-cols-1 lg:grid-cols-[40px_1fr_72px_56px_minmax(100px,1fr)] lg:items-center",
                  index % 2 === 0 ? "bg-card" : "bg-muted/10"
                )}
              >
                <span className="font-display flex size-7 items-center justify-center rounded-[4px] bg-brand/10 text-xs font-bold text-brand">
                  Q{index + 1}
                </span>
                <p
                  className="min-w-0 text-sm leading-snug text-foreground lg:line-clamp-1"
                  title={label}
                >
                  {label}
                </p>
                <span className="text-sm font-medium tabular-nums text-muted-foreground max-lg:hidden lg:text-right">
                  {row.counting}
                </span>
                <span
                  className={cn(
                    "font-display text-sm font-semibold tabular-nums max-lg:hidden lg:text-right",
                    pct >= 70
                      ? "text-emerald-600"
                      : pct >= 40
                        ? "text-amber-600"
                        : "text-rose-600"
                  )}
                >
                  {pct}%
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-teal-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground lg:hidden">
                    {row.counting} · {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AnalyticsCard>
  );
}
