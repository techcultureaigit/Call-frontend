import type { ID, Timestamps } from "./common";

export type CustomerStatus =
  | "active"
  | "inactive"
  | "lead"
  | "churned"
  | "prospect";

export type CustomerTier = "enterprise" | "mid_market" | "smb" | "startup";

export type CustomerSource =
  | "website"
  | "referral"
  | "campaign"
  | "import"
  | "manual";

export interface Customer extends Timestamps {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  jobTitle?: string;
  status: CustomerStatus;
  tier: CustomerTier;
  source: CustomerSource;
  ownerId: ID;
  ownerName: string;
  avatarUrl?: string;
  tags: string[];
  lastContactAt?: string;
  lifetimeValue: number;
  city?: string;
  country?: string;
  notes?: string;
}

export interface CustomerImportRow {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  jobTitle?: string;
  status?: CustomerStatus;
  tier?: CustomerTier;
}
