"use client";

import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PaginatedMeta } from "@/types";

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export interface DataPaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
  /** Disable page controls while the next page is loading. */
  disabled?: boolean;
  /** When set, shows a rows-per-page dropdown that passes `limit` to the caller. */
  onLimitChange?: (limit: number) => void;
  /** Options for the limit dropdown. Default: 10, 20, 50, 100 */
  limitOptions?: readonly number[];
  /** e.g. "surveys", "voices", "users" */
  itemLabel?: string;
  /** sticky footer (surveys list) vs inline (tables) */
  variant?: "sticky" | "inline";
  className?: string;
}

function getVisiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, totalPages, page]);
  for (let p = page - 1; p <= page + 1; p += 1) {
    if (p > 1 && p < totalPages) pages.add(p);
  }
  return Array.from(pages).sort((a, b) => a - b);
}

function PageSizeSelect({
  limit,
  options,
  onLimitChange,
  disabled = false,
}: {
  limit: number;
  options: number[];
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        Rows per page
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Rows per page"
            disabled={disabled}
            className={cn(
              "group inline-flex h-9 min-w-18 items-center justify-between gap-1.5 rounded-[6px]",
              "border border-border/50 bg-background/80 px-2.5 text-sm font-medium text-foreground",
              "shadow-subtle outline-none transition-[color,box-shadow,border-color] duration-200",
              "hover:border-primary/30 hover:bg-card",
              "focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/20",
              "data-[state=open]:border-brand data-[state=open]:ring-[3px] data-[state=open]:ring-brand/20",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <span className="tabular-nums">{limit}</span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="min-w-18 w-(--radix-dropdown-menu-trigger-width) p-1"
        >
          {options.map((n) => {
            const active = n === limit;
            return (
              <DropdownMenuItem
                key={n}
                onSelect={() => onLimitChange(n)}
                className={cn(
                  "cursor-pointer justify-between gap-3 rounded-[4px] px-2.5 py-1.5 text-sm",
                  active
                    ? "bg-accent font-semibold text-foreground"
                    : "text-muted-foreground focus:text-foreground"
                )}
              >
                <span className="tabular-nums">{n}</span>
                {active ? (
                  <Check className="size-3.5 shrink-0 text-primary" />
                ) : (
                  <span className="size-3.5 shrink-0" aria-hidden />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Shared list pagination — same idea as DataTable (one place for all modules). */
export function DataPagination({
  meta,
  onPageChange,
  disabled = false,
  onLimitChange,
  limitOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  itemLabel = "items",
  variant = "sticky",
  className,
}: DataPaginationProps) {
  const { page, totalPages, total, limit, hasPreviousPage, hasNextPage } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = getVisiblePages(page, totalPages);
  const sizeOptions = [
    ...new Set([...limitOptions, limit].filter((n) => n > 0)),
  ].sort((a, b) => a - b);

  if (total === 0) return null;

  const shell =
    variant === "sticky"
      ? "sticky bottom-0 z-10 -mx-1 mt-2 border-t border-border/50 bg-linear-to-t from-background via-background/95 to-background/80 px-1 pt-4 pb-1 backdrop-blur-sm"
      : "mt-2";

  return (
    <div className={cn(shell, className)}>
      <div className="flex flex-col gap-3 rounded-[6px] border border-border/50 bg-card/90 px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              Page {page} of {totalPages}
            </p>
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">{from}</span>–
              <span className="font-medium text-foreground">{to}</span> of{" "}
              <span className="font-medium text-foreground">{total}</span>{" "}
              {itemLabel}
            </p>
          </div>

          {onLimitChange ? (
            <PageSizeSelect
              limit={limit}
              options={sizeOptions}
              onLimitChange={onLimitChange}
              disabled={disabled}
            />
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || !hasPreviousPage}
            className="h-9 gap-1 rounded-[6px] px-3"
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center gap-1">
            {pages.map((p, index) => {
              const showEllipsis = index > 0 && p - pages[index - 1]! > 1;
              const isActive = p === page;
              return (
                <span key={p} className="flex items-center gap-1">
                  {showEllipsis ? (
                    <span className="px-1 text-xs text-muted-foreground">…</span>
                  ) : null}
                  <Button
                    type="button"
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(p)}
                    disabled={disabled}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Go to page ${p}`}
                    className={cn(
                      "size-9 rounded-[6px] p-0 text-xs font-semibold",
                      !isActive && "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p}
                  </Button>
                </span>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || !hasNextPage}
            className="h-9 gap-1 rounded-[6px] px-3"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
