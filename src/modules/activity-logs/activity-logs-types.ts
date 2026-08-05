/**
 * activity-logs-types.ts — Activity logs module types (no API calls).
 */
import type { ActivityLog } from "@/types/activity-log";

export interface ActivityLogsListParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  module?: string;
  actorId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ActivityLogStats {
  total: number;
  today: number;
  creates: number;
  updates: number;
  deletes: number;
  withChanges: number;
}

export interface ActivityLogFilterOptions {
  actors: { id: string; name: string }[];
}

export type { ActivityLog };
