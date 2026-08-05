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
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        searchAriaLabel={searchAriaLabel}
        filters={filters}
        actions={actions}
        disabled={toolbarDisabled}
      />
      {children}
      <DataPagination
        meta={meta}
        onPageChange={onPageChange}
        itemLabel={itemLabel}
      />
    </div>
  );
}
