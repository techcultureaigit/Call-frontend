"use client";

import {
  Download,
  FileSpreadsheet,
  Search,
  SlidersHorizontal,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomerFilters } from "./customers-advanced-filters";

interface CustomersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: CustomerFilters;
  filtersOpen: boolean;
  onFiltersToggle: () => void;
  onClearAll: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
  isExporting?: boolean;
  totalCount?: number;
}

export function CustomersToolbar({
  search,
  onSearchChange,
  filters,
  filtersOpen,
  onFiltersToggle,
  onClearAll,
  onImportClick,
  onExportClick,
  isExporting,
  totalCount,
}: CustomersToolbarProps) {
  const hasFilters =
    search.length > 0 ||
    filters.status !== "all" ||
    filters.tier !== "all" ||
    filters.source !== "all" ||
    filters.ownerId !== "all";

  const activeFilterCount = [
    filters.status !== "all",
    filters.tier !== "all",
    filters.source !== "all",
    filters.ownerId !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Customers
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage accounts, import contacts, and track customer lifecycle.
            {totalCount !== undefined && (
              <span className="ml-1 font-medium text-foreground">
                ({totalCount} total)
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onImportClick}
            className="h-9"
          >
            <Upload className="size-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportClick}
            disabled={isExporting}
            className="h-9"
          >
            <Download className="size-4" />
            {isExporting ? "Exporting…" : "Export"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[6px] border border-border/60 bg-card p-4 shadow-card lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, company, or tags..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 border-border/60 bg-muted/30 pl-9"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant={filtersOpen ? "secondary" : "outline"}
            size="sm"
            onClick={onFiltersToggle}
            className="h-9"
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-9 text-muted-foreground"
            >
              <X className="size-3.5" />
              Clear all
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
