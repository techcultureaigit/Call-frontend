"use client";

import { Search, SlidersHorizontal, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from "@/lib/validators/user";
import type { UserRole, UserStatus } from "@/types/user";

interface UsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: UserRole | "all";
  onRoleChange: (value: UserRole | "all") => void;
  status: UserStatus | "all";
  onStatusChange: (value: UserStatus | "all") => void;
  onCreateClick: () => void;
  totalCount?: number;
}

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
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Users
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage team members, roles, and access permissions.
            {totalCount !== undefined && (
              <span className="ml-1 font-medium text-foreground">
                ({totalCount} total)
              </span>
            )}
          </p>
        </div>
        <Button onClick={onCreateClick} className="shrink-0">
          <UserPlus className="size-4" />
          Create User
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-card lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 border-border/60 bg-muted/30 pl-9"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" />
            <Select
              value={role}
              onChange={(e) =>
                onRoleChange(e.target.value as UserRole | "all")
              }
              options={[
                { label: "All Roles", value: "all" },
                ...USER_ROLE_OPTIONS.map((o) => ({
                  label: o.label,
                  value: o.value,
                })),
              ]}
              className="w-full sm:w-[160px]"
            />
            <Select
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value as UserStatus | "all")
              }
              options={[
                { label: "All Statuses", value: "all" },
                ...USER_STATUS_OPTIONS.map((o) => ({
                  label: o.label,
                  value: o.value,
                })),
              ]}
              className="w-full sm:w-[160px]"
            />
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 text-muted-foreground"
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
