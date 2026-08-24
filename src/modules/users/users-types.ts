/**
 * users-types.ts — Users module types (no API calls).
 */
import type { User, UserStatus } from "@/types/user";

export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  /** role id or "all" */
  role?: string;
  status?: UserStatus | "all";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
  status?: UserStatus;
}

export type UpdateUserPayload = Partial<
  Omit<CreateUserPayload, "password"> & { password?: string }
>;

export type { User, UserStatus };
