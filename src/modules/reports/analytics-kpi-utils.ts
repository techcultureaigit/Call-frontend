import type { DashboardKpi, KpiAccent } from "@/types/dashboard";
import type { ReportKpi } from "@/types/reports";

const ICON_ACCENT: Record<string, KpiAccent> = {
  phone: "blue",
  connected: "cyan",
  check: "emerald",
  clock: "violet",
  missed: "rose",
  mic: "indigo",
};

/** Map analytics KPIs to dashboard pastel MetricBox format */
export function toDashboardKpis(kpis: ReportKpi[]): DashboardKpi[] {
  return kpis.map((kpi) => ({
    id: kpi.id,
    label: kpi.label,
    value: kpi.value,
    change: kpi.change,
    changeLabel: kpi.changeLabel,
    trend: kpi.trend,
    icon: kpi.icon ?? "phone",
    accent: ICON_ACCENT[kpi.icon ?? "phone"] ?? "blue",
    spark: kpi.spark,
  }));
}
