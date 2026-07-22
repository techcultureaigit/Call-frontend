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
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getInitials,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CustomerStatusBadge } from "./customer-status-badge";
import { TierBadge } from "./tier-badge";
import type { Customer } from "@/types/customer";

interface CustomersTableProps {
  customers: Customer[];
  isLoading?: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onRowClick: (customer: Customer) => void;
}

export function CustomersTable({
  customers,
  isLoading,
  sorting,
  onSortingChange,
  selectedIds,
  onSelectionChange,
  onRowClick,
}: CustomersTableProps) {
  const allSelected =
    customers.length > 0 && customers.every((c) => selectedIds.has(c.id));
  const someSelected =
    customers.some((c) => selectedIds.has(c.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      customers.forEach((c) => next.delete(c.id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      customers.forEach((c) => next.add(c.id));
      onSelectionChange(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={toggleAll}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedIds.has(row.original.id)}
              onChange={() => toggleOne(row.original.id)}
              aria-label={`Select ${row.original.firstName}`}
            />
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Customer",
        enableSorting: true,
        cell: ({ row }) => {
          const c = row.original;
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
                  {c.email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "company",
        header: "Company",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm">{row.original.company}</p>
            {row.original.jobTitle && (
              <p className="truncate text-xs text-muted-foreground">
                {row.original.jobTitle}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => (
          <CustomerStatusBadge status={row.original.status} />
        ),
      },
      {
        accessorKey: "tier",
        header: "Tier",
        enableSorting: true,
        cell: ({ row }) => <TierBadge tier={row.original.tier} />,
      },
      {
        accessorKey: "ownerName",
        header: "Owner",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.ownerName}
          </span>
        ),
      },
      {
        accessorKey: "lifetimeValue",
        header: "LTV",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums">
            {formatCurrency(row.original.lifetimeValue)}
          </span>
        ),
      },
      {
        accessorKey: "lastContactAt",
        header: "Last Contact",
        enableSorting: true,
        cell: ({ row }) => {
          const last = row.original.lastContactAt;
          return (
            <span className="text-sm text-muted-foreground">
              {last ? formatRelativeTime(last) : "—"}
            </span>
          );
        },
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
    ],
    [allSelected, someSelected, selectedIds]
  );

  const table = useReactTable({
    data: customers,
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
    return <CustomersTableSkeleton />;
  }

  if (customers.length === 0) {
    return (
      <div className="rounded-[6px] border border-border/60 bg-card shadow-card">
        <EmptyState
          icon={Users}
          title="No customers found"
          description="Try adjusting your search or filters, or import customers from CSV/Excel."
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px]">
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
                onClick={() => onRowClick(row.original)}
                className={cn(
                  "cursor-pointer border-b border-border/30 transition-colors last:border-0 hover:bg-muted/20",
                  selectedIds.has(row.original.id) && "bg-primary/5"
                )}
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

function CustomersTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
      <div className="space-y-0">
        <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/30 px-4 py-4 last:border-0"
          >
            <Skeleton className="size-4 rounded" />
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
