"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaginatedMeta } from "@/types";

interface SurveysPaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
  itemLabel?: string;
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

export function SurveysPagination({
  meta,
  onPageChange,
  itemLabel = "surveys",
}: SurveysPaginationProps) {
  const { page, totalPages, total, limit, hasPreviousPage, hasNextPage } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = getVisiblePages(page, totalPages);

  if (total === 0) return null;

  return (
    <div className="sticky bottom-0 z-10 -mx-1 mt-2 border-t border-border/50 bg-linear-to-t from-background via-background/95 to-background/80 px-1 pt-4 pb-1 backdrop-blur-sm">
      <div className="flex flex-col gap-3 rounded-[6px] border border-border/50 bg-card/90 px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPreviousPage}
            className="h-9 gap-1 rounded-[6px] px-3"
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center gap-1">
            {pages.map((p, index) => {
              const showEllipsis = index > 0 && p - pages[index - 1] > 1;
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
            disabled={!hasNextPage}
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
