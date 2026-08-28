"use client";

import type { ReactNode } from "react";
import { ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGE_TITLE_CLASS } from "@/components/shared/page-heading";
import { ListToolbar } from "@/components/shared/list-toolbar";

interface RolesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  roleCount?: number;
  columnsControl?: ReactNode;
  headerOnly?: boolean;
  filtersOnly?: boolean;
  embedded?: boolean;
}

export function RolesToolbar({
  search,
  onSearchChange,
  onCreateClick,
  roleCount,
  columnsControl,
  headerOnly = false,
  filtersOnly = false,
  embedded = false,
}: RolesToolbarProps) {
  if (filtersOnly) {
    return (
      <ListToolbar
        variant="embedded"
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search roles..."
        searchAriaLabel="Search roles"
        columnsControl={columnsControl}
      />
    );
  }

  return (
    <div className={headerOnly ? undefined : "space-y-4"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={PAGE_TITLE_CLASS}>
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

      {headerOnly ? null : (
        <ListToolbar
          variant={embedded ? "embedded" : "default"}
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search roles..."
          searchAriaLabel="Search roles"
          columnsControl={columnsControl}
        />
      )}
    </div>
  );
}
