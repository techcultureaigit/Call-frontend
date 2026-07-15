"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { dashboardService } from "@/services/dashboard.service";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardService.getOverview,
    staleTime: 2 * 60 * 1000,
  });
}
