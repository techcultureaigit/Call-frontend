/**
 * reports-types.ts — Reports / Analytics module types (no API calls).
 */
import type { ReportsData } from "@/types/reports";

export interface ReportsParams {
  from?: string;
  to?: string;
  /** Survey filter — "all" or survey ObjectId */
  surveyId?: string;
  /** @deprecated use surveyId */
  campaignId?: string;
}

export type { ReportsData };
