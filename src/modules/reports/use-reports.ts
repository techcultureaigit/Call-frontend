"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  getAnalyticsBreakdowns,
  getAnalyticsKpis,
  getAnalyticsTrends,
  getReportCampaigns,
  getReports,
  getAnalyticsDetails,
  getAnalyticsClientDetail,
  getQuestionAnalytics,
  type ReportsParams,
} from "./api";
import type { AnalyticsKpiFilterId } from "./analytics-kpi-filter";

const STALE = 30_000;

export function useAnalyticsKpis(params: ReportsParams) {
  return useQuery({
    queryKey: queryKeys.reports.kpis(params as Record<string, unknown>),
    queryFn: () => getAnalyticsKpis(params),
    placeholderData: (prev) => prev,
    staleTime: STALE,
    refetchOnWindowFocus: true,
  });
}

export function useAnalyticsBreakdowns(params: ReportsParams) {
  return useQuery({
    queryKey: queryKeys.reports.breakdowns(params as Record<string, unknown>),
    queryFn: () => getAnalyticsBreakdowns(params),
    placeholderData: (prev) => prev,
    staleTime: STALE,
    refetchOnWindowFocus: true,
  });
}

export function useAnalyticsTrends(params: ReportsParams) {
  return useQuery({
    queryKey: queryKeys.reports.trends(params as Record<string, unknown>),
    queryFn: () => getAnalyticsTrends(params),
    placeholderData: (prev) => prev,
    staleTime: STALE,
    refetchOnWindowFocus: true,
  });
}

/** @deprecated Prefer useAnalyticsKpis + useAnalyticsBreakdowns + useAnalyticsTrends */
export function useReports(params: ReportsParams) {
  return useQuery({
    queryKey: queryKeys.reports.data(params as Record<string, unknown>),
    queryFn: () => getReports(params),
    placeholderData: (prev) => prev,
    staleTime: STALE,
    refetchOnWindowFocus: true,
  });
}

export function useReportCampaigns() {
  return useQuery({
    queryKey: [...queryKeys.reports.all, "filters"] as const,
    queryFn: getReportCampaigns,
    staleTime: 120_000,
  });
}

export function useQuestionAnalytics(params: ReportsParams) {
  return useQuery({
    queryKey: queryKeys.reports.questions(params as Record<string, unknown>),
    queryFn: () => getQuestionAnalytics(params),
    placeholderData: (prev) => prev,
    staleTime: STALE,
    refetchOnWindowFocus: true,
  });
}

export function useAnalyticsDetails(
  params: {
    from?: string;
    to?: string;
    surveyId?: string;
    metric: AnalyticsKpiFilterId;
    page?: number;
    limit?: number;
    search?: string;
    callOutcome?: string;
    surveyStatus?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.reports.details(params as Record<string, unknown>),
    queryFn: () => getAnalyticsDetails(params),
    enabled: enabled && Boolean(params.metric),
    staleTime: 15_000,
  });
}

/** One client — per-question answers (popup expand) */
export function useAnalyticsClientDetail(resultId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reports.clientDetail(resultId || ""),
    queryFn: () => getAnalyticsClientDetail(resultId!),
    enabled: enabled && Boolean(resultId),
    staleTime: 60_000,
  });
}

export type { ReportsParams };
