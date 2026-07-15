import type { ID, Timestamps } from "./common";

export type DealStage =
  | "prospecting"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export type DealStatus = "open" | "won" | "lost";

export interface Deal extends Timestamps {
  id: ID;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  status: DealStatus;
  probability: number;
  expectedCloseDate?: string;
  closedAt?: string;
  accountId?: ID;
  contactId?: ID;
  ownerId: ID;
  pipelineId: ID;
  description?: string;
}
