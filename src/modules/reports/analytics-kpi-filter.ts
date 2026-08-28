import type { ChartDataPoint } from "@/types/dashboard";
import type { ReportsData } from "@/types/reports";

export type AnalyticsKpiFilterId =
  | "total_calls"
  | "connected"
  | "disconnected"
  | "survey_complete"
  | "survey_incomplete"
  | "survey_partial"
  | "survey_processing"
  | "survey_missed"
  | "avg_duration"
  | "missed"
  | "recording";

export type AnalyticsTrendMode = "all" | "connected" | "missed" | "completion";

export const KPI_FILTER_LABELS: Record<AnalyticsKpiFilterId, string> = {
  total_calls: "All calls",
  connected: "Connected calls",
  disconnected: "Disconnected calls",
  survey_complete: "Survey complete",
  survey_incomplete: "Incomplete",
  survey_partial: "Partially complete",
  survey_processing: "Processing",
  survey_missed: "Survey missed",
  avg_duration: "Avg duration",
  missed: "Missed calls",
  recording: "Recording coverage",
};

/** Map donut slice name → KPI filter for popup details */
export function sliceToKpiFilter(
  variant: "call" | "survey",
  sliceName: string
): AnalyticsKpiFilterId | null {
  const name = sliceName.trim().toLowerCase();
  if (variant === "call") {
    if (name === "connected") return "connected";
    if (name === "disconnected") return "disconnected";
    if (name === "missed") return "missed";
  }
  if (variant === "survey") {
    if (name === "complete") return "survey_complete";
    if (name === "incomplete") return "survey_incomplete";
    if (name === "partially complete") return "survey_partial";
    if (name === "processing") return "survey_processing";
    if (name === "missed") return "survey_incomplete";
  }
  return null;
}

export interface FilteredAnalyticsView {
  callsOverTime: ChartDataPoint[];
  trendData: ChartDataPoint[];
  trendMode: AnalyticsTrendMode;
  barMetricLabel: string;
  barDescription: string;
  trendDescription: string;
}

export function applyKpiFilter(
  data: ReportsData,
  filter: AnalyticsKpiFilterId
): FilteredAnalyticsView {
  const callsOverTime = data.callsOverTime ?? [];
  const completionTrend = data.completionTrend ?? data.successRateTrend ?? [];

  if (filter === "connected") {
    return {
      callsOverTime: callsOverTime.map((row) => ({
        ...row,
        calls: Number(row.connected ?? 0),
        value: Number(row.connected ?? 0),
      })),
      trendData: callsOverTime,
      trendMode: "connected",
      barMetricLabel: "connected calls",
      barDescription: "Connected calls per day",
      trendDescription: "Connected calls over time",
    };
  }

  if (filter === "disconnected") {
    return {
      callsOverTime: callsOverTime.map((row) => ({
        ...row,
        calls: Number(row.disconnected ?? 0),
        value: Number(row.disconnected ?? 0),
        connected: 0,
        missed: Number(row.disconnected ?? 0),
      })),
      trendData: callsOverTime,
      trendMode: "missed",
      barMetricLabel: "disconnected calls",
      barDescription: "Disconnected calls per day",
      trendDescription: "Disconnected calls over time",
    };
  }

  if (filter === "missed") {
    return {
      callsOverTime: callsOverTime.map((row) => ({
        ...row,
        calls: Number(row.missed ?? 0),
        value: Number(row.missed ?? 0),
      })),
      trendData: callsOverTime,
      trendMode: "missed",
      barMetricLabel: "missed calls",
      barDescription: "Missed calls per day",
      trendDescription: "Missed calls over time",
    };
  }

  if (filter === "survey_complete") {
    const mapped = completionTrend.map((row) => ({
      label: row.label,
      calls: Number(row.complete ?? 0),
      value: Number(row.complete ?? 0),
      connected: Number(row.complete ?? 0),
      missed: Math.max(
        0,
        Number(row.total ?? 0) - Number(row.complete ?? 0)
      ),
      success: Number(row.success ?? row.value ?? 0),
      total: Number(row.total ?? 0),
      complete: Number(row.complete ?? 0),
    }));

    return {
      callsOverTime: mapped,
      trendData: mapped,
      trendMode: "completion",
      barMetricLabel: "completed surveys",
      barDescription: "Completed surveys per day",
      trendDescription: "Survey completions over time",
    };
  }

  if (filter === "recording") {
    return {
      callsOverTime: callsOverTime.map((row) => ({
        ...row,
        calls: Number(row.connected ?? 0),
        value: Number(row.connected ?? 0),
      })),
      trendData: callsOverTime,
      trendMode: "connected",
      barMetricLabel: "connected calls",
      barDescription: "Connected calls with recording context",
      trendDescription: "Connected calls (recording coverage basis)",
    };
  }

  if (filter === "avg_duration") {
    return {
      callsOverTime,
      trendData: callsOverTime,
      trendMode: "all",
      barMetricLabel: "calls",
      barDescription: "Call volume for duration context",
      trendDescription: "Call volume alongside duration KPI",
    };
  }

  return {
    callsOverTime,
    trendData: callsOverTime,
    trendMode: "all",
    barMetricLabel: "calls",
    barDescription: "Daily volume across the selected period",
    trendDescription: "Call outcomes over time",
  };
}
