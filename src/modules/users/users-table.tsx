"use client";

import { useMemo, type ReactNode } from "react";
import type { SortingState } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  DataTable,
  DataTableSortHeader,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SUBTEXT_CLASS,
  TABLE_ROW_ACCENT_CLASS,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { formatDate, formatRelativeTime, getInitials } from "@/lib/utils";
import { RoleBadge } from "./role-badge";
import { StatusBadge } from "./status-badge";
import { isSuperAdminRole } from "@/types/role";
import type { User } from "@/types/user";

function isLockedUser(user: User) {
  return isSuperAdminRole(user.roleName || user.role);
}

interface UsersTableProps {
  users: User[];
  isLoading?: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User, active: boolean) => void;
  isTogglingId?: string;
  embedded?: boolean;
  onColumnsControlReady?: (control: ReactNode | null) => void;
}

function sortState(sorting: SortingState, id: string): false | "asc" | "desc" {
  const entry = sorting.find((s) => s.id === id);
  if (!entry) return false;
  return entry.desc ? "desc" : "asc";
}

function toggleSort(
  sorting: SortingState,
  onSortingChange: (sorting: SortingState) => void,
  id: string
) {
  const current = sorting.find((s) => s.id === id);
  if (!current) {
    onSortingChange([{ id, desc: false }]);
    return;
  }
  if (!current.desc) {
    onSortingChange([{ id, desc: true }]);
    return;
  }
  onSortingChange([]);
}

export function UsersTable({
  users,
  isLoading,
  sorting,
  onSortingChange,
  onEdit,
  onDelete,
  onToggleStatus,
  isTogglingId,
  embedded = false,
  onColumnsControlReady,
}: UsersTableProps) {
  const columns = useMemo<DataTableColumn<User>[]>(
    () => [
      {
        id: "name",
        label: "User",
        header: (
          <DataTableSortHeader
            label="User"
            sorted={sortState(sorting, "name")}
            onToggle={() => toggleSort(sorting, onSortingChange, "name")}
          />
        ),
        showAccent: true,
        cell: (user) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              {user.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={user.firstName} />
              )}
              <AvatarFallback className="bg-primary/8 text-xs font-medium text-primary">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className={TABLE_PRIMARY_TEXT_CLASS}>
                {user.firstName} {user.lastName}
              </p>
              <p className={TABLE_SUBTEXT_CLASS}>
                {user.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "role",
        label: "Role",
        header: (
          <DataTableSortHeader
            label="Role"
            sorted={sortState(sorting, "role")}
            onToggle={() => toggleSort(sorting, onSortingChange, "role")}
          />
        ),
        cell: (user) => (
          <RoleBadge role={user.roleName || user.role} />
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (user) => {
          const locked = isLockedUser(user);
          const isActive = user.status === "active";
          const canToggle =
            !locked &&
            (user.status === "active" || user.status === "inactive");

          return (
            <div className="flex items-center gap-3">
              <StatusBadge status={user.status} />
              {canToggle && (
                <Switch
                  checked={isActive}
                  disabled={isTogglingId === user.id}
                  onCheckedChange={(checked) => onToggleStatus(user, checked)}
                />
              )}
            </div>
          );
        },
      },
      {
        id: "lastLoginAt",
        label: "Last Login",
        header: (
          <DataTableSortHeader
            label="Last Login"
            sorted={sortState(sorting, "lastLoginAt")}
            onToggle={() => toggleSort(sorting, onSortingChange, "lastLoginAt")}
          />
        ),
        cell: (user) => (
          <span className="text-xs text-muted-foreground">
            {user.lastLoginAt
              ? formatRelativeTime(user.lastLoginAt)
              : "Never"}
          </span>
        ),
      },
      {
        id: "createdAt",
        label: "Joined",
        header: (
          <DataTableSortHeader
            label="Joined"
            sorted={sortState(sorting, "createdAt")}
            onToggle={() => toggleSort(sorting, onSortingChange, "createdAt")}
          />
        ),
        cell: (user) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(user.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        align: "right",
        cell: (user) => {
          if (isLockedUser(user)) {
            return (
              <span
                className="px-2 text-xs text-muted-foreground"
                title="Super Admin is locked"
              >
                Locked
              </span>
            );
          }
          return (
            <div data-row-ignore-click onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="size-8">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(user)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [
      sorting,
      onSortingChange,
      onEdit,
      onDelete,
      onToggleStatus,
      isTogglingId,
    ]
  );

  return (
    <DataTable
      embedded={embedded}
      columnLayoutKey="users"
      columns={columns}
      data={users}
      getRowId={(user) => user.id}
      onRowClick={(user) => {
        if (!isLockedUser(user)) onEdit(user);
      }}
      isLoading={isLoading}
      emptyIcon={Users}
      emptyTitle="No users found"
      emptyDescription="Try adjusting your search or filters, or create a new user."
      footerHint="Click a row to edit. Use the menu for more actions."
      minWidthClassName="min-w-200"
      getRowAccentClassName={() => TABLE_ROW_ACCENT_CLASS}
      skeletonRows={8}
      onColumnsControlReady={onColumnsControlReady}
    />
  );
}
