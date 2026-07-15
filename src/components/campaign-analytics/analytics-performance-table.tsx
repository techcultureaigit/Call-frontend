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
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import {
  formatCompactNumber,
  formatPercent,
} from "@/lib/utils";
import { AnalyticsCard } from "./analytics-card";
import { CampaignsPagination } from "@/components/campaigns/campaigns-pagination";
import type { CampaignPerformanceRow } from "@/types/campaign-analytics";
import type { PaginatedMeta } from "@/types/common";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface AnalyticsPerformanceTableProps {
  rows: CampaignPerformanceRow[];
  meta?: PaginatedMeta;
  isLoading?: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onPageChange: (page: number) => void;
}

export function AnalyticsPerformanceTable({
  rows,
  meta,
  isLoading,
  sorting,
  onSortingChange,
  onPageChange,
}: AnalyticsPerformanceTableProps) {
  const columns = useMemo<ColumnDef<CampaignPerformanceRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Campaign",
        cell: ({ row }) => (
          <div className="min-w-[140px]">
            <p className="font-medium">{row.original.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {row.original.surveyName}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "createdByName",
        header: "Created By",
        cell: ({ getValue }) => (
          <span className="text-sm">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "customers",
        header: "Customers",
        cell: ({ getValue }) => (
          <span className="tabular-nums">{getValue() as number}</span>
        ),
      },
      {
        accessorKey: "calls",
        header: "Calls",
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {formatCompactNumber(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "completed",
        header: "Completed",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-emerald-600">
            {formatCompactNumber(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "failed",
        header: "Failed",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-red-600">
            {formatCompactNumber(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "responseRate",
        header: "Response %",
        cell: ({ getValue }) => (
          <span className="tabular-nums font-medium">
            {formatPercent(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "successRate",
        header: "Success %",
        cell: ({ getValue }) => (
          <span className="tabular-nums font-medium">
            {formatPercent(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "avgDurationSeconds",
        header: "Avg Duration",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-muted-foreground">
            {formatDuration(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <CampaignStatusBadge
            status={getValue() as CampaignPerformanceRow["status"]}
          />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem>
                <Eye className="size-4" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  if (isLoading) {
    return (
      <AnalyticsCard title="Campaign Performance" description="Detailed metrics by campaign">
        <Skeleton className="h-64 w-full rounded-xl" />
      </AnalyticsCard>
    );
  }

  if (rows.length === 0) {
    return (
      <AnalyticsCard title="Campaign Performance" description="Detailed metrics by campaign">
        <EmptyState
          icon={ArrowUpDown}
          title="No campaigns match filters"
          description="Adjust your filters to see performance data."
        />
      </AnalyticsCard>
    );
  }

  return (
    <div className="space-y-4">
      <AnalyticsCard
        title="Campaign Performance"
        description="Sortable table with sticky header"
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="sticky top-0 z-10 border-b border-border/60 bg-card/95 backdrop-blur-md">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 hover:text-foreground"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {sorted === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="size-3" />
                            ) : header.column.getCanSort() ? (
                              <ArrowUpDown className="size-3 opacity-40" />
                            ) : null}
                          </button>
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
                  className="border-b border-border/30 transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnalyticsCard>

      {meta && meta.total > 0 && (
        <CampaignsPagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
}
