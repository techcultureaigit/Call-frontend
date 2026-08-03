import {
  usersApi,
  type BackendUser,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UsersListParams,
} from "@/api/users";
import { ApiClientError } from "@/lib/api";
import type { PaginatedResponse } from "@/types";
import type { User, UserStatus } from "@/types/user";
import { createEmptyPermissions } from "@/config/permission-modules";

export type { CreateUserPayload, UpdateUserPayload, UsersListParams };

function unwrapError(error: unknown, fallback: string): Error {
  if (error instanceof ApiClientError) {
    return new Error(error.message || fallback);
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function toStatus(isActive: boolean): UserStatus {
  return isActive ? "active" : "inactive";
}

function mapUser(raw: BackendUser): User {
  const { firstName, lastName } = splitName(raw.name || "");
  const roleName = raw.roleName || raw.role || "";
  return {
    id: raw.id || String(raw._id),
    email: raw.email,
    firstName,
    lastName,
    roleId: String(raw.roleId),
    roleName,
    role: roleName,
    permissions: createEmptyPermissions(),
    status: toStatus(Boolean(raw.isActive)),
    lastLoginAt: raw.lastLogin || undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function toMeta(pagination?: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}) {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

function toFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

function statusToActive(status?: UserStatus): boolean {
  return status === "active" || status === "invited";
}

/** Users service — Express `/api/v1/users` via axios */
export const usersModuleService = {
  list: async (
    params: UsersListParams = {}
  ): Promise<PaginatedResponse<User>> => {
    try {
      const res = await usersApi.list(params);
      return {
        data: (res.data ?? []).map(mapUser),
        meta: toMeta(res.pagination),
      };
    } catch (error) {
      throw unwrapError(error, "Failed to load users");
    }
  },

  getById: async (id: string): Promise<User> => {
    try {
      const res = await usersApi.getById(id);
      if (!res.data) throw new Error("User not found");
      return mapUser(res.data);
    } catch (error) {
      throw unwrapError(error, "Failed to load user");
    }
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    try {
      const res = await usersApi.create({
        name: toFullName(payload.firstName, payload.lastName),
        email: payload.email,
        password: payload.password,
        roleId: payload.roleId,
        isActive: statusToActive(payload.status),
      });
      if (!res.data) throw new Error("Failed to create user");
      return mapUser(res.data);
    } catch (error) {
      throw unwrapError(error, "Failed to create user");
    }
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    try {
      const body: {
        name?: string;
        email?: string;
        password?: string;
        roleId?: string;
        isActive?: boolean;
      } = {};
      if (payload.firstName !== undefined || payload.lastName !== undefined) {
        body.name = toFullName(
          payload.firstName ?? "",
          payload.lastName ?? ""
        );
      }
      if (payload.email !== undefined) body.email = payload.email;
      if (payload.password) body.password = payload.password;
      if (payload.roleId !== undefined) body.roleId = payload.roleId;
      if (payload.status !== undefined) {
        body.isActive = payload.status === "active";
      }

      const res = await usersApi.update(id, body);
      if (!res.data) throw new Error("Failed to update user");
      return mapUser(res.data);
    } catch (error) {
      throw unwrapError(error, "Failed to update user");
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await usersApi.delete(id);
    } catch (error) {
      throw unwrapError(error, "Failed to delete user");
    }
  },

  toggleStatus: async (id: string, status: UserStatus): Promise<User> => {
    try {
      const res = await usersApi.updateStatus(id, status === "active");
      if (!res.data) throw new Error("Failed to update status");
      return mapUser(res.data);
    } catch (error) {
      throw unwrapError(error, "Failed to update status");
    }
  },
};
