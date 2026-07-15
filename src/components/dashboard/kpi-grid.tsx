"use client";

import { KpiCard } from "./kpi-card";
import { KpiGridSkeleton } from "./dashboard-skeleton";
import type { DashboardKpi } from "@/types/dashboard";

interface KpiGridProps {
  kpis: DashboardKpi[];
  isLoading?: boolean;
}

export function KpiGrid({ kpis, isLoading }: KpiGridProps) {
  if (isLoading) return <KpiGridSkeleton />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, index) => (
        <KpiCard key={kpi.id} kpi={kpi} index={index} />
      ))}
    </div>
  );
}
