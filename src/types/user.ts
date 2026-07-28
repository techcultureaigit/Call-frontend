import type { ID, Timestamps } from "./common";
import type { RolePermissions } from "./role";

export type UserStatus = "active" | "inactive" | "invited" | "suspended";

/** Authenticated user — role is dynamic from backend Role model */
export interface User extends Timestamps {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  /** Mongo ObjectId of assigned Role */
  roleId: string;
  /** Display name from Role.name (any custom role) */
  roleName: string;
  /** Alias of roleName for legacy UI bindings */
  role: string;
  /** Live permission matrix from Role.permissions */
  permissions: RolePermissions;
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
  permissions: RolePermissions;
}
