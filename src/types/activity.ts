import type { ID, Timestamps } from "./common";

export type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "note"
  | "task"
  | "deal_update"
  | "status_change";

export interface Activity extends Timestamps {
  id: ID;
  type: ActivityType;
  title: string;
  description?: string;
  performedById: ID;
  relatedType: "account" | "contact" | "lead" | "deal";
  relatedId: ID;
  metadata?: Record<string, unknown>;
  occurredAt: string;
}
