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
  ScrollText,
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
import { ActivityLogActionBadge } from "./activity-log-action-badge";
import { ActivityLogModuleBadge } from "./activity-log-module-badge";
import type { ActivityLog } from "@/types/activity-log";

interface ActivityLogsTableProps {
  logs: ActivityLog[];
  isLoading?: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onRowClick: (log: ActivityLog) => void;
}

export function ActivityLogsTable({
  logs,
  isLoading,
  sorting,
  onSortingChange,
  onRowClick,
}: ActivityLogsTableProps) {
  const columns = useMemo<ColumnDef<ActivityLog>[]>(
    () => [
      {
        accessorKey: "occurredAt",
        header: "Time",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatRelativeTime(row.original.occurredAt)}
          </span>
        ),
      },
      {
        id: "actor",
        header: "Actor",
        cell: ({ row }) => {
          const actor = row.original.performedBy;
          const [first, last] = actor.name.split(" ");
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/8 text-[10px] font-medium text-primary">
                  {getInitials(first, last ?? "")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{actor.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {actor.role}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "action",
        header: "Action",
        enableSorting: true,
        cell: ({ row }) => (
          <ActivityLogActionBadge action={row.original.action} />
        ),
      },
      {
        accessorKey: "module",
        header: "Module",
        enableSorting: true,
        cell: ({ row }) => (
          <ActivityLogModuleBadge module={row.original.module} />
        ),
      },
      {
        id: "resource",
        header: "Resource",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {row.original.resourceName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.resourceType}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "summary",
        header: "Summary",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="min-w-0 max-w-xs">
            <p className="truncate text-sm">{row.original.summary}</p>
            {row.original.changes.length > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {row.original.changes.length} change
                {row.original.changes.length === 1 ? "" : "s"}
              </p>
            )}
          </div>
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
  } = useLaidOutColumnDefs("activity-logs", columns);

  const table = useReactTable({
    data: logs,
    columns: visibleColumns,
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
      <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
        <div className="space-y-0 divide-y divide-border/50 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
        <EmptyState
          icon={ScrollText}
          title="No activity logs found"
          description="Try adjusting your search or filters."
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
      <TableColumnsBar
        items={pickerItems}
        hidden={hidden}
        onToggle={toggleHidden}
        onReorder={reorder}
        onReset={reset}
      />
      <div className="overflow-x-auto">
        <TableColumnDnd
          ids={visibleColumns.map(getColumnDefId)}
          lockedIds={lockedIds}
          onReorder={reorder}
        >
        <table className="w-full min-w-[900px]">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <SortableTanstackHeaderRow
                key={group.id}
                headerGroup={group}
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
