import type { ID, Timestamps } from "./common";

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "stopped";

export type CampaignType =
  | "outbound_sales"
  | "customer_survey"
  | "follow_up"
  | "support";

export interface CampaignSchedule {
  startDate: string;
  endDate?: string;
  timeZone: string;
  callWindowStart: string;
  callWindowEnd: string;
  daysOfWeek: number[];
}

export interface CampaignStats {
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  pendingCalls: number;
  successRate: number;
  responses: number;
  avgDurationSeconds: number;
  lastUpdatedAt: string;
}

export interface Campaign extends Timestamps {
  id: ID;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  surveyId?: string;
  surveyName?: string;
  customerIds: string[];
  customerCount: number;
  schedule?: CampaignSchedule;
  stats: CampaignStats;
  createdBy: string;
  createdByName: string;
}

export interface CreateCampaignPayload {
  name: string;
  description?: string;
  type: CampaignType;
  surveyId: string;
  surveyName: string;
  customerIds: string[];
  schedule: CampaignSchedule;
  status?: CampaignStatus;
}

export interface CampaignWizardValues {
  name: string;
  description: string;
  type: CampaignType;
  customerIds: string[];
  surveyId: string;
  schedule: CampaignSchedule;
}
