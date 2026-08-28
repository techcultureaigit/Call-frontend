"use client";

import { useMemo, type ReactNode } from "react";
import {
  Eye,
  KeyRound,
  Lock,
  Pencil,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import {
  DataTable,
  DataTableActionButton,
  DataTableActionDivider,
  DataTableActionGroup,
  DataTableMetaChip,
  DataTablePrimaryCell,
  TABLE_ROW_ACCENT_CLASS,
  TABLE_STATUS_BADGE_CLASS,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { cn } from "@/lib/utils";
import {
  isProtectedRole,
  isSuperAdminRole,
  type RoleListItem,
} from "@/types/role";

interface RolesTableProps {
  roles: RoleListItem[];
  onOpen: (role: RoleListItem) => void;
  onEdit: (role: RoleListItem) => void;
  onDelete: (role: RoleListItem) => void;
  isLoading?: boolean;
  embedded?: boolean;
  onColumnsControlReady?: (control: ReactNode | null) => void;
}

export function RolesTable({
  roles,
  onOpen,
  onEdit,
  onDelete,
  isLoading,
  embedded = false,
  onColumnsControlReady,
}: RolesTableProps) {
  const columns = useMemo<DataTableColumn<RoleListItem>[]>(
    () => [
      {
        id: "role",
        header: "Role",
        showAccent: true,
        cell: (role) => {
          const superAdmin = isSuperAdminRole(role.name);
          return (
            <DataTablePrimaryCell
              icon={
                superAdmin ? (
                  <Lock className="size-4" />
                ) : (
                  <Shield className="size-4" />
                )
              }
              title={role.name}
              subtitle={
                role.description || "Open to configure module permissions"
              }
              selected={superAdmin}
            />
          );
        },
      },
      {
        id: "type",
        header: "Type",
        cell: (role) => {
          const protectedRole = isProtectedRole(role.name);
          const superAdmin = isSuperAdminRole(role.name);
          if (protectedRole) {
            return (
              <span className={cn(TABLE_STATUS_BADGE_CLASS, "gap-1 bg-muted px-2 py-1 text-muted-foreground")}>
                <Lock className="size-3" />
                {superAdmin ? "Locked" : "System"}
              </span>
            );
          }
          return (
            <span className={cn(TABLE_STATUS_BADGE_CLASS, "bg-emerald-500/10 px-2 py-1 text-emerald-700")}>
              Custom
            </span>
          );
        },
      },
      {
        id: "users",
        header: "Users",
        cell: (role) => (
          <DataTableMetaChip
            icon={Users}
            label={String(role.userCount)}
            tabular
          />
        ),
      },
      {
        id: "coverage",
        header: "Access coverage",
        cell: (role) => {
          const progress =
            role.totalPermissions > 0
              ? (role.permissionCount / role.totalPermissions) * 100
              : 0;
          return (
            <div className="min-w-40 max-w-55 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <KeyRound className="size-3" />
                  Permissions
                </span>
                <span className="font-semibold tabular-nums text-foreground">
                  {role.permissionCount}/{role.totalPermissions}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        align: "right",
        cell: (role) => {
          const protectedRole = isProtectedRole(role.name);
          const superAdmin = isSuperAdminRole(role.name);
          return (
            <DataTableActionGroup>
              <DataTableActionButton
                label={superAdmin ? "View role" : "View permissions"}
                onClick={() => onOpen(role)}
                tone="sky"
              >
                <Eye className="size-3.5" />
              </DataTableActionButton>

              {!superAdmin ? (
                <DataTableActionButton
                  label="Edit role"
                  onClick={() => onEdit(role)}
                  tone="emerald"
                >
                  <Pencil className="size-3.5" />
                </DataTableActionButton>
              ) : (
                <span
                  className="inline-flex size-7 items-center justify-center text-muted-foreground"
                  title="Super Admin is locked"
                >
                  <Lock className="size-3.5" />
                </span>
              )}

              {!protectedRole ? (
                <>
                  <DataTableActionDivider />
                  <DataTableActionButton
                    label="Delete role"
                    onClick={() => onDelete(role)}
                    tone="danger"
                  >
                    <Trash2 className="size-3.5" />
                  </DataTableActionButton>
                </>
              ) : null}
            </DataTableActionGroup>
          );
        },
      },
    ],
    [onOpen, onEdit, onDelete]
  );

  return (
    <DataTable
      embedded={embedded}
      columnLayoutKey="roles"
      columns={columns}
      data={roles}
      getRowId={(role) => role.id}
      onRowClick={onOpen}
      isLoading={isLoading}
      emptyIcon={Shield}
      emptyTitle="No roles found"
      emptyDescription="Try a different search term or create a new role."
      footerHint="Click a role to open its permissions page."
      minWidthClassName="min-w-190"
      getRowAccentClassName={() => TABLE_ROW_ACCENT_CLASS}
      skeletonRows={4}
      onColumnsControlReady={onColumnsControlReady}
    />
  );
}
