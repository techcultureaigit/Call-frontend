import { sanitizePermissions } from "@/config/permission-modules";
import type { AuthSession, AuthTokens } from "@/types/auth";
import type { RolePermissions } from "@/types/role";
import type { User, UserStatus } from "@/types/user";

export interface BackendRolePayload {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  permissions?: RolePermissions;
  isSystem?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendAuthUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  roleId?: string | { _id?: string };
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: BackendRolePayload | string | null;
  permissions?: RolePermissions;
}

export interface BackendLoginData {
  accessToken: string;
  refreshToken?: string;
  user: BackendAuthUser;
}

function splitName(name = ""): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function asId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

function roleNameFrom(user: BackendAuthUser): string {
  if (user.role && typeof user.role === "object") return user.role.name ?? "";
  if (typeof user.role === "string") return user.role;
  return "";
}

function roleIdFrom(user: BackendAuthUser): string {
  if (user.role && typeof user.role === "object") {
    return asId(user.role._id ?? user.role.id);
  }
  return asId(user.roleId);
}

function permissionsFrom(user: BackendAuthUser): RolePermissions {
  if (user.role && typeof user.role === "object" && user.role.permissions) {
    return sanitizePermissions(user.role.permissions);
  }
  if (user.permissions) return sanitizePermissions(user.permissions);
  return sanitizePermissions({});
}

export function mapBackendUser(user: BackendAuthUser): User {
  const { firstName, lastName } = splitName(user.name);
  const roleName = roleNameFrom(user);
  const status: UserStatus = user.isActive === false ? "inactive" : "active";

  return {
    id: asId(user._id ?? user.id),
    email: user.email ?? "",
    firstName,
    lastName,
    roleId: roleIdFrom(user),
    roleName,
    role: roleName,
    permissions: permissionsFrom(user),
    status,
    lastLoginAt: user.lastLogin,
    createdAt: user.createdAt ?? new Date().toISOString(),
    updatedAt: user.updatedAt ?? new Date().toISOString(),
  };
}

export function mapLoginToSession(data: BackendLoginData): AuthSession {
  const tokens: AuthTokens = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? "",
    expiresIn: 900,
  };

  return {
    user: mapBackendUser(data.user),
    tokens,
  };
}
