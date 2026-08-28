/**
 * api.ts
 * Analytics HTTP API — Express /api/v1/analytics
 *
 * getReports()         GET  /api/analytics
 * getReportCampaigns() GET  /api/analytics/surveys
 */
import { apiGet, unwrapData } from "@/api/http";
import { createModuleApiCall } from "@/lib/api/module-helpers";
import type { ApiResponse } from "@/types/api";
import type {
  AnalyticsBreakdownsData,
  AnalyticsClientDetail,
  AnalyticsDetailsData,
  AnalyticsKpisData,
  AnalyticsTrendsData,
  QuestionAnalyticsData,
  ReportsData,
} from "@/types/reports";
import type { ReportsParams } from "./reports-types";
import type { AnalyticsKpiFilterId } from "./analytics-kpi-filter";

export type { ReportsParams };

const KPI_ICON: Record<string, string> = {
  total_calls: "phone",
  connected: "connected",
  disconnected: "disconnected",
  missed: "missed",
  survey_complete: "check",
  survey_partial: "partial",
  survey_processing: "processing",
  survey_incomplete: "incomplete",
  avg_duration: "clock",
  recording: "mic",
};

function normalizeReportsData(data: ReportsData): ReportsData {
  return {
    ...data,
    kpis: (data.kpis ?? []).map((kpi) => ({
      ...kpi,
      icon: kpi.icon ?? KPI_ICON[kpi.id] ?? "phone",
    })),
    callsOverTime: data.callsOverTime ?? [],
    callOutcomeBreakdown: data.callOutcomeBreakdown ?? [],
    surveyStatusBreakdown: data.surveyStatusBreakdown ?? [],
    hangupBreakdown: data.hangupBreakdown ?? [],
    questions: data.questions ?? [],
    questionBars: data.questionBars ?? [],
    insights: data.insights ?? [],
  };
}

const reportsCall = createModuleApiCall("reports");

function buildSurveyQuery(params: ReportsParams = {}) {
  return {
    from: params.from,
    to: params.to,
    surveyId:
      params.surveyId && params.surveyId !== "all"
        ? params.surveyId
        : params.campaignId && params.campaignId !== "all"
          ? params.campaignId
          : undefined,
  };
}

function normalizeKpis(data: AnalyticsKpisData): AnalyticsKpisData {
  return {
    ...data,
    kpis: (data.kpis ?? []).map((kpi) => ({
      ...kpi,
      icon: kpi.icon ?? KPI_ICON[kpi.id] ?? "phone",
    })),
  };
}

export type AnalyticsSurveyOption = {
  id: string;
  name: string;
  status?: string;
};

/* ========== SPLIT ANALYTICS APIs ========== */

/** getAnalyticsKpis() → GET /api/analytics/kpis */
export async function getAnalyticsKpis(params: ReportsParams = {}) {
  const query = buildSurveyQuery(params);
  return reportsCall("getAnalyticsKpis", "GET", "/api/analytics/kpis", async () => {
    const data = await unwrapData(
      apiGet<ApiResponse<AnalyticsKpisData>>("/api/analytics/kpis", query)
    );
    return normalizeKpis(data);
  }, query);
}

/** getAnalyticsBreakdowns() → GET /api/analytics/breakdowns */
export async function getAnalyticsBreakdowns(params: ReportsParams = {}) {
  const query = buildSurveyQuery(params);
  return reportsCall(
    "getAnalyticsBreakdowns",
    "GET",
    "/api/analytics/breakdowns",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<AnalyticsBreakdownsData>>(
          "/api/analytics/breakdowns",
          query
        )
      );
    },
    query
  );
}

/** getAnalyticsTrends() → GET /api/analytics/trends */
export async function getAnalyticsTrends(params: ReportsParams = {}) {
  const query = buildSurveyQuery(params);
  return reportsCall(
    "getAnalyticsTrends",
    "GET",
    "/api/analytics/trends",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<AnalyticsTrendsData>>("/api/analytics/trends", query)
      );
    },
    query
  );
}

/* ========== LEGACY — GET /api/analytics (full payload) ========== */

/** getReports() → GET /api/analytics — legacy, prefer split APIs */
export async function getReports(params: ReportsParams = {}) {
  const query = buildSurveyQuery(params);

  return reportsCall("getReports", "GET", "/api/analytics", async () => {
    const data = await unwrapData(
      apiGet<ApiResponse<ReportsData>>("/api/analytics", query)
    );
    return normalizeReportsData({
      ...data,
      campaignId: data.surveyId,
      campaignName: data.surveyName,
    } as ReportsData);
  }, query);
}

/** getReportCampaigns() → GET /api/analytics/surveys */
export async function getReportCampaigns() {
  return reportsCall(
    "getReportCampaigns",
    "GET",
    "/api/analytics/surveys",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<AnalyticsSurveyOption[]>>("/api/analytics/surveys")
      );
    }
  );
}

/** getSurveyAnalytics() → GET /api/analytics/surveys/:id */
export async function getSurveyAnalytics(
  surveyId: string,
  params: Omit<ReportsParams, "surveyId" | "campaignId"> = {}
) {
  return reportsCall(
    "getSurveyAnalytics",
    "GET",
    `/api/analytics/surveys/${surveyId}`,
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<ReportsData>>(
          `/api/analytics/surveys/${surveyId}`,
          params
        )
      );
    },
    params
  );
}

/** getAnalyticsDetails() → GET /api/analytics/details */
export type AnalyticsDetailsParams = ReportsParams & {
  metric?: AnalyticsKpiFilterId;
  page?: number;
  limit?: number;
  search?: string;
  callOutcome?: string;
  surveyStatus?: string;
};

export async function getAnalyticsDetails(params: AnalyticsDetailsParams = {}) {
  const query = {
    from: params.from,
    to: params.to,
    metric: params.metric ?? "total_calls",
    page: params.page,
    limit: params.limit,
    search: params.search?.trim() || undefined,
    callOutcome:
      params.callOutcome && params.callOutcome !== "all"
        ? params.callOutcome
        : undefined,
    surveyStatus:
      params.surveyStatus && params.surveyStatus !== "all"
        ? params.surveyStatus
        : undefined,
    surveyId:
      params.surveyId && params.surveyId !== "all"
        ? params.surveyId
        : params.campaignId && params.campaignId !== "all"
          ? params.campaignId
          : undefined,
  };

  return reportsCall(
    "getAnalyticsDetails",
    "GET",
    "/api/analytics/details",
    async () => {
      return await unwrapData(
        apiGet<ApiResponse<AnalyticsDetailsData>>("/api/analytics/details", query)
      );
    },
    query
  );
}

/** getQuestionAnalytics() → GET /api/analytics/questions */
export async function getQuestionAnalytics(params: ReportsParams = {}) {
  const query = buildSurveyQuery(params);

  return reportsCall(
    "getQuestionAnalytics",
    "GET",
    "/api/analytics/questions",
    async () => {
      const data = await unwrapData(
        apiGet<ApiResponse<QuestionAnalyticsData>>(
          "/api/analytics/questions",
          query
        )
      );
      return {
        ...data,
        questions: data.questions ?? [],
        totalQuestions: data.totalQuestions ?? data.questions?.length ?? 0,
        totalAnswers: data.totalAnswers ?? 0,
      } as QuestionAnalyticsData;
    },
    query
  );
}

/** getAnalyticsClientDetail() → GET /api/analytics/details/:id */
export async function getAnalyticsClientDetail(resultId: string) {
  return reportsCall(
    "getAnalyticsClientDetail",
    "GET",
    `/api/analytics/details/${resultId}`,
    async () => {
      const data = await unwrapData(
        apiGet<ApiResponse<AnalyticsClientDetail>>(
          `/api/analytics/details/${resultId}`
        )
      );
      return {
        ...data,
        questions: data.questions ?? [],
      } as AnalyticsClientDetail;
    }
  );
}

/* ---------- namespace ---------- */
export const reportsApi = {
  getKpis: getAnalyticsKpis,
  getBreakdowns: getAnalyticsBreakdowns,
  getTrends: getAnalyticsTrends,
  getData: getReports,
  getCampaigns: getReportCampaigns,
  getSurveyAnalytics,
  getDetails: getAnalyticsDetails,
  getQuestions: getQuestionAnalytics,
  getClientDetail: getAnalyticsClientDetail,
};
