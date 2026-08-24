"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  getActivityLog,
  getActivityLogFilterOptions,
  getActivityLogStats,
  listActivityLogs,
  type ActivityLogsListParams,
} from "./api";

export function useActivityLogs(params: ActivityLogsListParams) {
  return useQuery({
    queryKey: queryKeys.activityLogs.module(
      params as Record<string, unknown>
    ),
    queryFn: () => listActivityLogs(params),
    placeholderData: (prev) => prev,
  });
}

export function useActivityLogStats() {
  return useQuery({
    queryKey: queryKeys.activityLogs.stats(),
    queryFn: getActivityLogStats,
  });
}

export function useActivityLogFilterOptions() {
  return useQuery({
    queryKey: queryKeys.activityLogs.filters(),
    queryFn: getActivityLogFilterOptions,
    staleTime: 120_000,
  });
}

export function useActivityLogDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.activityLogs.detail(id ?? ""),
    queryFn: () => getActivityLog(id!),
    enabled: Boolean(id),
  });
}

export type { ActivityLogsListParams };
