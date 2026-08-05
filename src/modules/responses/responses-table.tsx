"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MessageSquareReply,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { ResponseStatusBadge } from "./response-status-badge";
import { SentimentBadge } from "./sentiment-badge";
import type { SurveyResponse } from "@/types/response";

interface ResponsesTableProps {
  responses: SurveyResponse[];
  isLoading?: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onRowClick: (response: SurveyResponse) => void;
}

export function ResponsesTable({
  responses,
  isLoading,
  sorting,
  onSortingChange,
  onRowClick,
}: ResponsesTableProps) {
  const columns = useMemo<ColumnDef<SurveyResponse>[]>(
    () => [
      {
        accessorKey: "customerName",
        header: "Customer",
        enableSorting: true,
        cell: ({ row }) => {
          const c = row.original.customer;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/8 text-xs font-medium text-primary">
                  {getInitials(c.firstName, c.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {c.firstName} {c.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.company}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "campaignName",
        header: "Campaign",
        cell: ({ row }) => (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {row.original.campaignName}
          </span>
        ),
      },
      {
        accessorKey: "surveyName",
        header: "Survey",
        cell: ({ row }) => (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {row.original.surveyName}
          </span>
        ),
      },
      {
        id: "sentiment",
        header: "AI Sentiment",
        cell: ({ row }) => (
          <SentimentBadge
            sentiment={row.original.aiExtracted.sentiment}
            score={row.original.aiExtracted.sentimentScore}
          />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => (
          <ResponseStatusBadge status={row.original.status} />
        ),
      },
      {
        id: "nps",
        header: "NPS",
        cell: ({ row }) => {
          const nps = row.original.aiExtracted.npsScore;
          return (
            <span className="text-sm font-medium tabular-nums">
              {nps ?? "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "submittedAt",
        header: "Submitted",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(row.original.submittedAt)}
          </span>
        ),
      },
      {
        id: "ai",
        header: "",
        cell: () => (
          <Sparkles className="size-4 text-violet-500/60" />
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: responses,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-0 overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/30 px-4 py-4 last:border-0"
          >
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="rounded-[6px] border border-border/60 bg-card shadow-card">
        <EmptyState
          icon={MessageSquareReply}
          title="No responses found"
          description="Try adjusting your search or filters."
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="border-b border-border/60 bg-muted/30"
              >
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1.5 hover:text-foreground"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row.original)}
                className="cursor-pointer border-b border-border/30 transition-colors last:border-0 hover:bg-muted/20"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
