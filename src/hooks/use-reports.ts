"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { reportsApi, type ReportsParams } from "@/api";

export function useReports(params: ReportsParams) {
  return useQuery({
    queryKey: queryKeys.reports.data(params as Record<string, unknown>),
    queryFn: () => reportsApi.getData(params),
    placeholderData: (prev) => prev,
  });
}

export function useReportCampaigns() {
  return useQuery({
    queryKey: [...queryKeys.reports.all, "filters"] as const,
    queryFn: () => reportsApi.getCampaigns(),
    staleTime: 120_000,
  });
}
