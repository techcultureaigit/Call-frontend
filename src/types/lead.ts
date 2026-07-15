import type { ID, Timestamps } from "./common";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "unqualified"
  | "converted"
  | "lost";

export type LeadSource =
  | "website"
  | "referral"
  | "cold_call"
  | "email"
  | "social"
  | "event"
  | "other";

export interface Lead extends Timestamps {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  source: LeadSource;
  score?: number;
  ownerId: ID;
  convertedAt?: string;
  convertedContactId?: ID;
}
