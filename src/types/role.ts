import type { Timestamps, ID } from "./common";
import type { NavModule } from "@/config/permissions";

export type PermissionAction = "create" | "read" | "update" | "delete";

export type PermissionModule = NavModule;

export interface ModulePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export type RolePermissions = Record<PermissionModule, ModulePermissions>;

export interface Role extends Timestamps {
  id: ID;
  name: string;
  slug: string;
  description: string;
  color: string;
  isSystem: boolean;
  userCount: number;
  permissions: RolePermissions;
}

export interface RoleListItem extends Role {
  permissionCount: number;
  totalPermissions: number;
}
