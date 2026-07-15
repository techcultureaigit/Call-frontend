import type { ChartDataPoint } from "./dashboard";

export interface ReportKpi {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
}

export interface ReportPieSlice {
  name: string;
  value: number;
  fill: string;
}

export interface ReportsData {
  kpis: ReportKpi[];
  callsOverTime: ChartDataPoint[];
  successRateTrend: ChartDataPoint[];
  responsesByCampaign: ChartDataPoint[];
  campaignBreakdown: ReportPieSlice[];
  sentimentBreakdown: ReportPieSlice[];
  dateRange: { from: string; to: string };
  campaignId: string | "all";
  campaignName?: string;
}

export interface ReportsQueryParams {
  from?: string;
  to?: string;
  campaignId?: string;
}
