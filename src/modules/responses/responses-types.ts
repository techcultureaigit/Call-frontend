/**
 * responses-types.ts — Responses module types (no API calls).
 */
import type { SurveyResponse } from "@/types/response";

export interface ResponsesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  campaignId?: string;
  surveyId?: string;
  sentiment?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ResponseStats {
  total: number;
  pending: number;
  flagged: number;
  completed: number;
  positive: number;
}

export interface ResponseFilterOptions {
  campaigns: { id: string; name: string }[];
  surveys: { id: string; name: string }[];
}

export type { SurveyResponse };
