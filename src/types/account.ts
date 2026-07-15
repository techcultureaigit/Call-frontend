import type { ID, Timestamps } from "./common";

export type AccountType = "prospect" | "customer" | "partner" | "vendor";
export type AccountStatus = "active" | "inactive" | "churned";

export interface Account extends Timestamps {
  id: ID;
  name: string;
  type: AccountType;
  status: AccountStatus;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  annualRevenue?: number;
  employeeCount?: number;
  ownerId: ID;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}
