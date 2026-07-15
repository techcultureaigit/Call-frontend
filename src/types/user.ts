import type { ID, Timestamps } from "./common";

export type UserRole = "super_admin" | "admin" | "manager" | "sales_rep" | "viewer";
export type UserStatus = "active" | "inactive" | "invited" | "suspended";

export interface User extends Timestamps {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  timezone?: string;
  lastLoginAt?: string;
}

export interface UserProfile extends User {
  bio?: string;
  department?: string;
  jobTitle?: string;
}

export interface TeamMember extends User {
  permissions: string[];
}
