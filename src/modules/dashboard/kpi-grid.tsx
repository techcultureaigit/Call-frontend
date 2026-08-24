"use client";

import type { LucideIcon } from "lucide-react";
import { KpiCard, MetricBox } from "./kpi-card";
import { KpiGridSkeleton } from "./dashboard-skeleton";
import type { DashboardKpi } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface KpiModuleProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  kpis: DashboardKpi[];
  isLoading?: boolean;
  className?: string;
  variant?: "voice" | "studio";
  compact?: boolean;
}

export function KpiModule({
  title,
  description,
  icon: Icon,
  kpis,
  isLoading,
  className,
  variant = "voice",
  compact = false,
}: KpiModuleProps) {
  const isStudio = variant === "studio";

  return (
    <section
      className={cn(
        "rounded-[6px] border border-border/60 bg-card shadow-card",
        compact ? "p-2.5 sm:p-3" : "p-4 sm:p-5",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          compact ? "mb-2" : "mb-4 gap-2.5"
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-[6px] text-white",
            compact ? "size-7" : "size-9",
            isStudio
              ? "bg-violet-500"
              : "bg-gradient-to-br from-brand to-brand-blue"
          )}
        >
          <Icon className={compact ? "size-3.5" : "size-4"} />
        </span>
        <div className="min-w-0">
          <h3
            className={cn(
              "font-semibold tracking-tight text-foreground",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {title}
          </h3>
          {description && !compact && (
            <p className="text-[12px] text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <KpiGridSkeleton count={6} />
      ) : (
        <div
          className={cn(
            "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6",
            compact ? "gap-2" : "grid-cols-1 gap-3"
          )}
        >
          {kpis.map((kpi, index) => (
            <MetricBox
              key={kpi.id}
              kpi={kpi}
              index={index}
              compact={compact}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface KpiGridProps {
  kpis: DashboardKpi[];
  isLoading?: boolean;
}

export function KpiGrid({ kpis, isLoading }: KpiGridProps) {
  if (isLoading) return <KpiGridSkeleton />;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi, index) => (
        <KpiCard key={kpi.id} kpi={kpi} index={index} />
      ))}
    </div>
  );
}
