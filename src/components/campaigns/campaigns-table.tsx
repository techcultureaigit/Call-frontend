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
  Megaphone,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { CAMPAIGN_TYPE_OPTIONS } from "@/lib/constants/campaigns";
import {
  formatCompactNumber,
  formatDate,
  formatPercent,
} from "@/lib/utils";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { CampaignActions } from "./campaign-actions";
import type { Campaign } from "@/types/campaign";

function getTypeLabel(type: Campaign["type"]) {
  return CAMPAIGN_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

interface CampaignsTableProps {
  campaigns: Campaign[];
  isLoading?: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
  onRetry: (id: string) => void;
  onLaunch: (id: string) => void;
  isActionLoading?: boolean;
}

export function CampaignsTable({
  campaigns,
  isLoading,
  sorting,
  onSortingChange,
  onPause,
  onResume,
  onStop,
  onRetry,
  onLaunch,
  isActionLoading,
}: CampaignsTableProps) {
  const columns = useMemo<ColumnDef<Campaign>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Campaign",
        enableSorting: true,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {getTypeLabel(c.type)}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => (
          <CampaignStatusBadge
            status={row.original.status}
            pulse={row.original.status === "active"}
          />
        ),
      },
      {
        accessorKey: "customerCount",
        header: "Customers",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {row.original.customerCount}
          </span>
        ),
      },
      {
        accessorKey: "stats.totalCalls",
        header: "Calls",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {formatCompactNumber(row.original.stats.totalCalls)}
          </span>
        ),
      },
      {
        accessorKey: "stats.successRate",
        header: "Success",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums">
            {formatPercent(row.original.stats.successRate)}
          </span>
        ),
      },
      {
        accessorKey: "stats.responses",
        header: "Responses",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {formatCompactNumber(row.original.stats.responses)}
          </span>
        ),
      },
      {
        accessorKey: "stats.failedCalls",
        header: "Failed",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {formatCompactNumber(row.original.stats.failedCalls)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <CampaignActions
            campaign={row.original}
            onPause={onPause}
            onResume={onResume}
            onStop={onStop}
            onRetry={onRetry}
            onLaunch={onLaunch}
            isLoading={isActionLoading}
          />
        ),
      },
    ],
    [onPause, onResume, onStop, onRetry, onLaunch, isActionLoading]
  );

  const table = useReactTable({
    data: campaigns,
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
    return <CampaignsTableSkeleton />;
  }

  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card shadow-card">
        <EmptyState
          icon={Megaphone}
          title="No campaigns found"
          description="Create a new campaign or adjust your filters."
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border/60 bg-muted/30"
              >
                {headerGroup.headers.map((header) => {
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
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
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
                className="border-b border-border/30 transition-colors last:border-0 hover:bg-muted/20"
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

function CampaignsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-card">
      <div className="space-y-0">
        <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/30 px-4 py-4 last:border-0"
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
