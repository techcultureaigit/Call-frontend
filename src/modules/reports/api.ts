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
import type { AnalyticsDetailsData, ReportsData } from "@/types/reports";
import type { ReportsParams } from "./reports-types";
import type { AnalyticsKpiFilterId } from "./analytics-kpi-filter";

export type { ReportsParams };

const KPI_ICON: Record<string, string> = {
  total_calls: "phone",
  connected: "connected",
  survey_complete: "check",
  avg_duration: "clock",
  missed: "missed",
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
    questionBars: data.questionBars ?? [],
    insights: data.insights ?? [],
  };
}

const reportsCall = createModuleApiCall("reports");

export type AnalyticsSurveyOption = {
  id: string;
  name: string;
  status?: string;
};

/* ========== READ — GET /api/analytics ========== */

/** getReports() → GET /api/analytics */
export async function getReports(params: ReportsParams = {}) {
  const query = {
    from: params.from,
    to: params.to,
    surveyId:
      params.surveyId && params.surveyId !== "all"
        ? params.surveyId
        : params.campaignId && params.campaignId !== "all"
          ? params.campaignId
          : undefined,
  };

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
};

export async function getAnalyticsDetails(params: AnalyticsDetailsParams = {}) {
  const query = {
    from: params.from,
    to: params.to,
    metric: params.metric ?? "total_calls",
    page: params.page,
    limit: params.limit,
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

/* ---------- namespace ---------- */
export const reportsApi = {
  getData: getReports,
  getCampaigns: getReportCampaigns,
  getSurveyAnalytics,
  getDetails: getAnalyticsDetails,
};
