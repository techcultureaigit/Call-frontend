"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { activityLogsApi, type ActivityLogsListParams } from "@/api";

export function useActivityLogs(params: ActivityLogsListParams) {
  return useQuery({
    queryKey: queryKeys.activityLogs.module(
      params as Record<string, unknown>
    ),
    queryFn: () => activityLogsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useActivityLogStats() {
  return useQuery({
    queryKey: queryKeys.activityLogs.stats(),
    queryFn: () => activityLogsApi.getStats(),
  });
}

export function useActivityLogFilterOptions() {
  return useQuery({
    queryKey: queryKeys.activityLogs.filters(),
    queryFn: () => activityLogsApi.getFilterOptions(),
    staleTime: 120_000,
  });
}

export function useActivityLogDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.activityLogs.detail(id ?? ""),
    queryFn: () => activityLogsApi.getById(id!),
    enabled: Boolean(id),
  });
}
