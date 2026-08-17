"use client";

import { ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/shared/list-toolbar";

interface RolesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  roleCount?: number;
}

export function RolesToolbar({
  search,
  onSearchChange,
  onCreateClick,
  roleCount,
}: RolesToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Roles & Permissions
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage roles here — open any role to configure its permissions.
            {roleCount !== undefined && (
              <span className="ml-1 font-medium text-foreground">
                ({roleCount} roles)
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={onCreateClick}
          className="h-11 shrink-0 rounded-[6px] px-5 shadow-brand"
        >
          <ShieldPlus className="size-4" />
          Create Role
        </Button>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search roles..."
        searchAriaLabel="Search roles"
      />
    </div>
  );
}
