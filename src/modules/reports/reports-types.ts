/**
 * reports-types.ts — Reports module types (no API calls).
 */
import type { ReportsData } from "@/types/reports";

export interface ReportsParams {
  from?: string;
  to?: string;
  campaignId?: string;
}

export type { ReportsData };
