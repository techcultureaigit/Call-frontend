"use client";

import { Search, ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Roles & Permissions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure access control with module-wise CRUD permissions.
            {roleCount !== undefined && (
              <span className="ml-1 font-medium text-foreground">
                ({roleCount} roles)
              </span>
            )}
          </p>
        </div>
        <Button onClick={onCreateClick} className="shrink-0">
          <ShieldPlus className="size-4" />
          Create Role
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 border-border/60 bg-muted/30 pl-9"
        />
      </div>
    </div>
  );
}
