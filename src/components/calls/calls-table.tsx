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
  MoreHorizontal,
  Phone,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCallDuration } from "@/lib/constants/calls";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { CallStatusBadge } from "./call-status-badge";
import type { Call } from "@/types/call";

interface CallsTableProps {
  calls: Call[];
  isLoading?: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onRowClick: (call: Call) => void;
  onRetry: (id: string) => void;
  isRetryingId?: string;
}

export function CallsTable({
  calls,
  isLoading,
  sorting,
  onSortingChange,
  onRowClick,
  onRetry,
  isRetryingId,
}: CallsTableProps) {
  const columns = useMemo<ColumnDef<Call>[]>(
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
                {c.avatarUrl && (
                  <AvatarImage src={c.avatarUrl} alt={c.firstName} />
                )}
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
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => (
          <CallStatusBadge
            status={row.original.status}
            pulse={["in_progress", "queued"].includes(row.original.status)}
          />
        ),
      },
      {
        accessorKey: "campaignName",
        header: "Campaign",
        cell: ({ row }) => (
          <span className="truncate text-sm text-muted-foreground">
            {row.original.campaignName ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "agentName",
        header: "Agent",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.agentName}</span>
        ),
      },
      {
        accessorKey: "durationSeconds",
        header: "Duration",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {formatCallDuration(row.original.durationSeconds)}
          </span>
        ),
      },
      {
        accessorKey: "startedAt",
        header: "Started",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(row.original.startedAt)}
          </span>
        ),
      },
      {
        id: "recording",
        header: "",
        cell: ({ row }) =>
          row.original.recordingUrl ? (
            <span className="inline-flex size-6 items-center justify-center rounded-md bg-violet-500/10 text-violet-600">
              <FileText className="size-3" />
            </span>
          ) : null,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const call = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onRowClick(call)}>
                  <FileText className="size-4" />
                  View Transcript
                </DropdownMenuItem>
                {call.canRetry && (
                  <DropdownMenuItem
                    onClick={() => onRetry(call.id)}
                    disabled={isRetryingId === call.id}
                  >
                    <RefreshCw className="size-4" />
                    Retry Call
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onRowClick, onRetry, isRetryingId]
  );

  const table = useReactTable({
    data: calls,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  if (isLoading) return <CallsTableSkeleton />;

  if (calls.length === 0) {
    return (
      <div className="rounded-[6px] border border-border/60 bg-card shadow-card">
        <EmptyState
          icon={Phone}
          title="No calls found"
          description="Try adjusting your search or status filter."
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border/60 bg-muted/30"
              >
                {table.getHeaderGroups()[0].headers.map((header) => {
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

function CallsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
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
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
