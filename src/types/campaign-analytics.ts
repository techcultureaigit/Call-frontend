import type { ChartDataPoint } from "./dashboard";
import type { PaginatedMeta } from "./common";
import type { CampaignStatus } from "./campaign";
import type { ReportPieSlice } from "./reports";

export interface CampaignAnalyticsKpi {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
  gradient: string;
  icon: string;
}

export interface CampaignPerformanceRow {
  id: string;
  name: string;
  createdBy: string;
  createdByName: string;
  customers: number;
  calls: number;
  completed: number;
  failed: number;
  responseRate: number;
  successRate: number;
  avgDurationSeconds: number;
  status: CampaignStatus;
  tags: string[];
  language: string;
  surveyName: string;
}

export interface TopPerformingCampaign {
  id: string;
  name: string;
  rank: number;
  completionPct: number;
  responsePct: number;
  aiScore: number;
  gradient: string;
  accent: string;
}

export type AnalyticsActivityType =
  | "started"
  | "completed"
  | "paused"
  | "failed"
  | "retry";

export interface AnalyticsActivity {
  id: string;
  type: AnalyticsActivityType;
  campaignId: string;
  campaignName: string;
  timestamp: string;
  detail?: string;
}

export interface RealtimeMetrics {
  liveCampaigns: number;
  liveCalls: number;
  queueSize: number;
  workersOnline: number;
  processingSpeed: number;
  campaigns: { id: string; name: string; status: CampaignStatus; calls: number }[];
}

export interface AiAnalytics {
  conversationScore: number;
  avgConfidence: number;
  avgResponseTimeMs: number;
  avgSurveyCompletion: number;
  sentiment: { positive: number; neutral: number; negative: number };
  topIntents: { intent: string; count: number; pct: number }[];
  topQuestions: { question: string; count: number }[];
  responseAccuracy: number;
}

export interface EngagementHeatmapCell {
  day: string;
  hour: number;
  value: number;
}

export interface CampaignAnalyticsFilters {
  campaigns: { id: string; name: string }[];
  surveys: { id: string; name: string }[];
  creators: { id: string; name: string }[];
  languages: { value: string; label: string }[];
  tags: string[];
  statuses: { value: string; label: string }[];
}

export interface CampaignAnalyticsData {
  kpis: CampaignAnalyticsKpi[];
  performanceLine: ChartDataPoint[];
  dailyCalls: ChartDataPoint[];
  callStatusPie: ReportPieSlice[];
  successRateArea: ChartDataPoint[];
  campaignComparison: ChartDataPoint[];
  responseRateTrend: ChartDataPoint[];
  languageDistribution: ReportPieSlice[];
  engagementHeatmap: EngagementHeatmapCell[];
  aiAnalytics: AiAnalytics;
  performanceTable: CampaignPerformanceRow[];
  tableMeta: PaginatedMeta;
  topPerforming: TopPerformingCampaign[];
  recentActivities: AnalyticsActivity[];
  realtime: RealtimeMetrics;
  filterOptions: CampaignAnalyticsFilters;
  dateRange: { from: string; to: string };
  compareEnabled: boolean;
  isEmpty: boolean;
}

export interface CampaignAnalyticsQueryParams {
  from?: string;
  to?: string;
  campaignId?: string;
  status?: string;
  language?: string;
  surveyId?: string;
  createdBy?: string;
  tag?: string;
  comparePeriod?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
