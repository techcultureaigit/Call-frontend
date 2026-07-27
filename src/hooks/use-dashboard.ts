"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { dashboardApi } from "@/api";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardApi.getOverview,
    staleTime: 2 * 60 * 1000,
  });
}
