import type { ID, Timestamps } from "./common";

export type ContactStatus = "active" | "inactive" | "bounced";

export interface Contact extends Timestamps {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  status: ContactStatus;
  accountId?: ID;
  ownerId: ID;
  avatarUrl?: string;
}
