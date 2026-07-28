"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  activityLogsModuleService,
  type ActivityLogsListParams,
} from "@/services/activity-logs-module.service";

export function useActivityLogs(params: ActivityLogsListParams) {
  return useQuery({
    queryKey: queryKeys.activityLogs.module(
      params as Record<string, unknown>
    ),
    queryFn: () => activityLogsModuleService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useActivityLogStats() {
  return useQuery({
    queryKey: queryKeys.activityLogs.stats(),
    queryFn: () => activityLogsModuleService.getStats(),
  });
}

export function useActivityLogFilterOptions() {
  return useQuery({
    queryKey: queryKeys.activityLogs.filters(),
    queryFn: () => activityLogsModuleService.getFilterOptions(),
    staleTime: 120_000,
  });
}

export function useActivityLogDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.activityLogs.detail(id ?? ""),
    queryFn: () => activityLogsModuleService.getById(id!),
    enabled: Boolean(id),
  });
}
