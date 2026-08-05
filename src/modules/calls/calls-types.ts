/**
 * calls-types.ts — Calls module types (no API calls).
 */
import type { Call } from "@/types/call";

export interface CallsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  hasRecording?: boolean;
  liveOnly?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CallStats {
  live: number;
  completed: number;
  failed: number;
  withRecording: number;
  total: number;
}

export type { Call };
