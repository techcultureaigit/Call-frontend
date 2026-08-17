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
  MessageSquareReply,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  TableColumnsBar,
  TableColumnDnd,
  SortableTanstackHeaderRow,
  getColumnDefId,
  TABLE_BODY_CELL_CLASS,
  TABLE_BODY_ROW_CLASS,
  useLaidOutColumnDefs,
} from "@/components/shared/table-column-layout";
import { formatRelativeTime, getInitials, cn } from "@/lib/utils";
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
        meta: { label: "AI" },
        cell: () => (
          <Sparkles className="size-4 text-violet-500/60" />
        ),
      },
    ],
    []
  );

  const {
    visibleColumns,
    pickerItems,
    hidden,
    toggleHidden,
    reorder,
    reset,
    lockedIds,
  } = useLaidOutColumnDefs("responses", columns);

  const table = useReactTable({
    data: responses,
    columns: visibleColumns,
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
      <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
        <EmptyState
          icon={MessageSquareReply}
          title="No responses found"
          description="Try adjusting your search or filters."
        />
      </div>
    );
  }

  const pickerBar = (
    <TableColumnsBar
      items={pickerItems}
      hidden={hidden}
      onToggle={toggleHidden}
      onReorder={reorder}
      onReset={reset}
    />
  );

  return (
    <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
      {pickerBar}
      <div className="overflow-x-auto">
        <TableColumnDnd
          ids={visibleColumns.map(getColumnDefId)}
          lockedIds={lockedIds}
          onReorder={reorder}
        >
        <table className="w-full min-w-[800px]">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <SortableTanstackHeaderRow
                key={hg.id}
                headerGroup={hg}
              />
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row.original)}
                className={cn(TABLE_BODY_ROW_CLASS, "cursor-pointer")}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={TABLE_BODY_CELL_CLASS}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </TableColumnDnd>
      </div>
    </div>
  );
}
