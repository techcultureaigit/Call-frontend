"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
} from "lucide-react";
import { ChartSkeleton } from "@/modules/dashboard/dashboard-skeleton";
import { AnalyticsCard } from "@/modules/reports/analytics-card";
import { cn } from "@/lib/utils";
import type { AnalyticsInsight } from "@/types/reports";

const toneStyle = {
  success: {
    icon: CheckCircle2,
    border: "border-emerald-200/80 dark:border-emerald-500/30",
    iconBg: "bg-emerald-500/15 text-emerald-600",
    bg: "bg-emerald-50/80 dark:bg-emerald-500/8",
    title: "text-emerald-800 dark:text-emerald-300",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-200/80 dark:border-amber-500/30",
    iconBg: "bg-amber-500/15 text-amber-600",
    bg: "bg-amber-50/80 dark:bg-amber-500/8",
    title: "text-amber-800 dark:text-amber-300",
  },
  info: {
    icon: Info,
    border: "border-sky-200/80 dark:border-sky-500/30",
    iconBg: "bg-sky-500/15 text-sky-600",
    bg: "bg-sky-50/80 dark:bg-sky-500/8",
    title: "text-sky-800 dark:text-sky-300",
  },
} as const;

function InsightItems({ rows }: { rows: AnalyticsInsight[] }) {
  return (
    <ul className="grid w-full gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((item) => {
        const cfg = toneStyle[item.tone] || toneStyle.info;
        const Icon = cfg.icon;
        return (
          <li
            key={item.id}
            className={cn(
              "rounded-[6px] border px-3 py-2.5",
              cfg.border,
              cfg.bg
            )}
          >
            <div className="flex gap-2.5">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  cfg.iconBg
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold", cfg.title)}>
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {item.message}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ReportInsights({
  insights,
  isLoading,
  variant = "card",
}: {
  insights?: AnalyticsInsight[];
  isLoading?: boolean;
  variant?: "card" | "strip";
}) {
  const rows = insights?.length
    ? insights.slice(0, 3)
    : [
        {
          id: "empty",
          tone: "info" as const,
          title: "Collecting insights",
          message: "More survey data will unlock recommendations.",
        },
      ];

  if (isLoading) {
    if (variant === "strip") {
      return <ChartSkeleton height={72} />;
    }
    return (
      <AnalyticsCard title="Insights" description="Survey recommendations" icon={Lightbulb}>
        <ChartSkeleton height={120} />
      </AnalyticsCard>
    );
  }

  if (variant === "strip") {
    return <InsightItems rows={rows} />;
  }

  return (
    <AnalyticsCard title="Insights" description="Survey recommendations" icon={Lightbulb}>
      <InsightItems rows={rows} />
    </AnalyticsCard>
  );
}
