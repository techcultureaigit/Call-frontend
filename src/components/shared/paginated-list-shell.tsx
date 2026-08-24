"use client";

import type { ReactNode } from "react";
import { DataPagination } from "@/components/shared/data-pagination";
import { ListToolbar } from "@/components/shared/list-toolbar";
import type { PaginatedMeta } from "@/types";

export interface PaginatedListShellProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  toolbarDisabled?: boolean;
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  children: ReactNode;
}

/** Shared list layout: search bar + content + pagination (DRY for survey list & response). */
export function PaginatedListShell({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  searchAriaLabel = "Search",
  filters,
  actions,
  toolbarDisabled,
  meta,
  onPageChange,
  itemLabel = "items",
  children,
}: PaginatedListShellProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <ListToolbar
        className="shrink-0"
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        searchAriaLabel={searchAriaLabel}
        filters={filters}
        actions={actions}
        disabled={toolbarDisabled}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
      <DataPagination
        meta={meta}
        onPageChange={onPageChange}
        itemLabel={itemLabel}
        variant="inline"
        className="shrink-0"
      />
    </div>
  );
}
