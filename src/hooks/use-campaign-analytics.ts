"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { campaignAnalyticsService } from "@/services/campaign-analytics.service";
import type { CampaignAnalyticsQueryParams } from "@/types/campaign-analytics";

export function useCampaignAnalytics(params: CampaignAnalyticsQueryParams) {
  return useQuery({
    queryKey: queryKeys.campaigns.analytics(
      params as Record<string, unknown>
    ),
    queryFn: () => campaignAnalyticsService.getAnalytics(params),
    placeholderData: (prev) => prev,
    refetchInterval: 30000,
  });
}

export function useCampaignAnalyticsRefresh() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ["campaigns", "analytics"],
    });
}
