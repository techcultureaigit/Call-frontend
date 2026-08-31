import type { ChartDataPoint } from "./dashboard";

export interface ReportKpi {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
  spark?: number[];
  icon?: string;
}

export interface ReportPieSlice {
  name: string;
  value: number;
  count?: number;
  fill: string;
}

export interface AnalyticsCallCounts {
  total: number;
  connected: number;
  missed: number;
  connectRate: number;
  pie: ReportPieSlice[];
}

export interface AnalyticsSurveyCounts {
  complete: number;
  incomplete: number;
  partially_complete?: number;
  missed: number;
  total: number;
  counting: string;
  completionRate: number;
  attempted: number;
  attemptedCounting: string;
  contactsTotal: number;
  contactCoverage: number | null;
  pie: ReportPieSlice[];
}

export interface AnalyticsDuration {
  averageSeconds: number | null;
  medianSeconds: number | null;
  averageLabel: string;
  medianLabel: string;
  sampleSize: number;
}

export interface AnalyticsQuestionBar {
  label: string;
  fullLabel?: string;
  questionId?: string;
  answered: number;
  unanswered: number;
  value: number;
  counting: string;
  answerRate: number;
}

export interface AnalyticsQuestionDetail {
  surveyId: string;
  surveyName: string;
  questionId: string;
  question: string;
  type: string;
  answered: number;
  unanswered: number;
  total: number;
  answerRate: number;
  counting: string;
  usersAnswered?: number;
  usersSkipped?: number;
  totalUsers?: number;
  topAnswers: { name: string; count: number; percent: number }[];
  answers?: { name: string; count: number; percent: number }[];
  users?: {
    phone: string;
    answer: string;
    answeredAt: string | null;
  }[];
}

export interface QuestionAnalyticsData {
  dateRange: { from: string; to: string };
  surveyId: string | "all";
  surveyName?: string;
  totalQuestions: number;
  totalAnswers: number;
  questions: AnalyticsQuestionDetail[];
}

export interface AnalyticsSurveyBreakdown {
  surveyId: string;
  name: string;
  label: string;
  total: number;
  value: number;
  responses: number;
  complete: number;
  incomplete: number;
  partially_complete: number;
  callsMissed: number;
  connected: number;
  avgDurationSeconds: number | null;
  completionRate: number;
  counting: string;
  /** @deprecated use callsMissed */
  missed?: number;
}

export interface AnalyticsHeatmap {
  days: string[];
  hours: string[];
  cells: {
    dayIndex: number;
    hourIndex: number;
    day: string;
    hour: number;
    value: number;
  }[];
  max: number;
}

export interface AnalyticsInsight {
  id: string;
  tone: "success" | "warning" | "info";
  title: string;
  message: string;
}

export interface AnalyticsMeta {
  dateRange: { from: string; to: string };
  surveyId: string | "all";
  surveyName?: string;
}

/** GET /analytics/kpis */
export interface AnalyticsKpisData extends AnalyticsMeta {
  kpis: ReportKpi[];
}

/** GET /analytics/breakdowns */
export interface AnalyticsBreakdownsData extends AnalyticsMeta {
  responsesBySurvey: AnalyticsSurveyBreakdown[];
  surveyStatusBreakdown: ReportPieSlice[];
  callOutcomeBreakdown: ReportPieSlice[];
  survey: AnalyticsSurveyCounts;
  calls: AnalyticsCallCounts;
  duration: AnalyticsDuration;
  recording: {
    withRecording: number;
    withoutRecording: number;
    coverageRate: number;
  };
}

/** GET /analytics/trends */
export interface AnalyticsTrendsData extends AnalyticsMeta {
  completionTrend: ChartDataPoint[];
  callsOverTime: ChartDataPoint[];
}

export interface ReportsData {
  kpis: ReportKpi[];
  insights?: AnalyticsInsight[];
  heatmap?: AnalyticsHeatmap;
  calls: AnalyticsCallCounts;
  survey: AnalyticsSurveyCounts;
  duration: AnalyticsDuration;
  recording: {
    withRecording: number;
    withoutRecording: number;
    coverageRate: number;
  };
  callsOverTime: ChartDataPoint[];
  successRateTrend: ChartDataPoint[];
  completionTrend: ChartDataPoint[];
  responsesByCampaign: ChartDataPoint[];
  responsesBySurvey: AnalyticsSurveyBreakdown[];
  campaignBreakdown: ReportPieSlice[];
  callOutcomeBreakdown: ReportPieSlice[];
  surveyStatusBreakdown: ReportPieSlice[];
  hangupBreakdown: ReportPieSlice[];
  sentimentBreakdown: ReportPieSlice[];
  questions: AnalyticsQuestionDetail[];
  questionBars: AnalyticsQuestionBar[];
  dateRange: { from: string; to: string };
  surveyId: string | "all";
  surveyName?: string;
  campaignId?: string | "all";
  campaignName?: string;
}

export interface AnalyticsDetailRow {
  id: string;
  phone: string;
  surveyId: string;
  surveyName: string;
  callOutcome: "connected" | "missed";
  callStatus: string;
  surveyStatus:
    | "complete"
    | "incomplete"
    | "partially_complete"
    | "missed";
  durationSeconds: number | null;
  durationLabel: string;
  extractedAt: string | null;
  hasRecording: boolean;
  hangupCause: string;
  answeredQuestions: number;
  totalQuestions: number;
  progress: string;
}

/** One question answer for a single client (from details/:id API) */
export interface AnalyticsClientQuestion {
  index: number;
  questionId: string;
  question: string;
  type: string;
  answered: boolean;
  answer: string | null;
  status: "answered" | "skipped";
}

export interface AnalyticsClientDetail extends AnalyticsDetailRow {
  questions: AnalyticsClientQuestion[];
}

export interface AnalyticsDetailsData {
  metric: string;
  metricLabel: string;
  dateRange: { from: string; to: string };
  surveyId: string;
  total: number;
  rows: AnalyticsDetailRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ReportsQueryParams {
  from?: string;
  to?: string;
  surveyId?: string;
  campaignId?: string;
}
