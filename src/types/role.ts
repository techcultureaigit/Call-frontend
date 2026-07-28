import type { Timestamps, ID } from "./common";
import type { NavModule } from "@/config/permissions";

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "export"
  | "import"
  | "upload"
  | "download"
  | "publish";

export type PermissionModule = NavModule | string;

export interface ModulePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
  upload: boolean;
  download: boolean;
  publish: boolean;
}

/** Dynamic matrix keyed by backend module ids */
export type RolePermissions = Record<string, ModulePermissions>;

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
