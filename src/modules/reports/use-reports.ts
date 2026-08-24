"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { getReportCampaigns, getReports, getAnalyticsDetails, type ReportsParams } from "./api";
import type { AnalyticsKpiFilterId } from "./analytics-kpi-filter";

export function useReports(params: ReportsParams) {
  return useQuery({
    queryKey: queryKeys.reports.data(params as Record<string, unknown>),
    queryFn: () => getReports(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
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

export function useAnalyticsDetails(
  params: {
    from?: string;
    to?: string;
    surveyId?: string;
    metric: AnalyticsKpiFilterId;
    page?: number;
    limit?: number;
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

export type { ReportsParams };
