"use client";

import { useEffect, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import type { RoleListItem } from "@/types/role";
import type { UserStatus } from "@/types/user";
import { listRoles } from "@/modules/roles/api";

interface UsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  status: UserStatus | "all";
  onStatusChange: (value: UserStatus | "all") => void;
  onCreateClick: () => void;
  totalCount?: number;
}

const filterSelectClass =
  "h-11 w-full rounded-[6px] border-border/50 bg-background/80 shadow-subtle sm:w-44";

export function UsersToolbar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  onCreateClick,
  totalCount,
}: UsersToolbarProps) {
  const [roles, setRoles] = useState<RoleListItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // API: listRoles() → GET /api/roles
        const data = await listRoles();
        if (!cancelled) setRoles(data);
      } catch {
        if (!cancelled) setRoles([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasFilters = role !== "all" || status !== "all" || search.length > 0;

  const clearFilters = () => {
    onSearchChange("");
    onRoleChange("all");
    onStatusChange("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Users
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage team members, roles, and access permissions.
            {totalCount !== undefined && (
              <span className="ml-1 font-medium text-foreground">
                ({totalCount} total)
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={onCreateClick}
          className="h-11 shrink-0 rounded-[6px] px-5 shadow-brand"
        >
          <UserPlus className="size-4" />
          Create User
        </Button>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by name or email..."
        searchAriaLabel="Search users"
        filters={
          <>
            <Select
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              options={[
                { label: "All roles", value: "all" },
                ...roles.map((r) => ({
                  label: r.name,
                  value: r.id,
                })),
              ]}
              className={filterSelectClass}
              aria-label="Filter by role"
            />
            <Select
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value as UserStatus | "all")
              }
              options={[
                { label: "All statuses", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              className={filterSelectClass}
              aria-label="Filter by status"
            />
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-11 shrink-0 text-muted-foreground"
              >
                <X className="size-3.5" />
                Clear
              </Button>
            ) : null}
          </>
        }
      />
    </div>
  );
}
