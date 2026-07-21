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
}

export function KpiModule({
  title,
  description,
  icon: Icon,
  kpis,
  isLoading,
  className,
  variant = "voice",
}: KpiModuleProps) {
  const isStudio = variant === "studio";

  return (
    <section
      className={cn(
        "rounded-[6px] border border-border/60 bg-card p-4 shadow-card sm:p-5",
        className
      )}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-[6px] text-white",
            isStudio
              ? "bg-violet-500"
              : "bg-gradient-to-br from-brand to-brand-blue"
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-[12px] text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <KpiGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpis.map((kpi, index) => (
            <MetricBox key={kpi.id} kpi={kpi} index={index} />
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
