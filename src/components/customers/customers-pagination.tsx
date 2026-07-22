"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginatedMeta } from "@/types";

interface CustomersPaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
}

export function CustomersPagination({
  meta,
  onPageChange,
}: CustomersPaginationProps) {
  const { page, totalPages, total, limit, hasPreviousPage, hasNextPage } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 rounded-[6px] border border-border/60 bg-card px-4 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span> to{" "}
        <span className="font-medium text-foreground">{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> customers
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className="h-8"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 || p === totalPages || Math.abs(p - page) <= 1
            )
            .map((p, index, arr) => {
              const showEllipsis = index > 0 && p - arr[index - 1] > 1;
              return (
                <span key={p} className="flex items-center">
                  {showEllipsis && (
                    <span className="px-1 text-xs text-muted-foreground">
                      …
                    </span>
                  )}
                  <Button
                    variant={p === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(p)}
                    className="size-8 p-0 text-xs"
                  >
                    {p}
                  </Button>
                </span>
              );
            })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="h-8"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
