"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  reportsModuleService,
  type ReportsParams,
} from "@/services/reports-module.service";

export function useReports(params: ReportsParams) {
  return useQuery({
    queryKey: queryKeys.reports.data(params as Record<string, unknown>),
    queryFn: () => reportsModuleService.getData(params),
    placeholderData: (prev) => prev,
  });
}

export function useReportCampaigns() {
  return useQuery({
    queryKey: [...queryKeys.reports.all, "filters"] as const,
    queryFn: () => reportsModuleService.getCampaigns(),
    staleTime: 120_000,
  });
}
