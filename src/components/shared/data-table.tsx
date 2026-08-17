
"use client";

import { useMemo, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Inbox, ArrowUp, ArrowDown, ArrowUpDown, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  TableColumnsBar,
  TableColumnDnd,
  SortableColumnTh,
  applyColumnLayout,
  columnLabelFromHeader,
  resolveColumnPin,
  useTableColumnLayout,
  TABLE_HEAD_ROW_CLASS,
  TABLE_BODY_ROW_CLASS,
  TABLE_BODY_CELL_CLASS,
  TABLE_SELECT_CELL_CLASS,
  type TableColumnLayoutItem,
} from "@/components/shared/table-column-layout";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "right";
  /** Label in the Columns picker (defaults to string header or id). */
  label?: string;
  /** Default true. Select / actions stay visible. */
  hideable?: boolean;
  pin?: "start" | "end";
  /** Show status accent bar on this column (usually first / select) */
  showAccent?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  footerHint?: string;
  minWidthClassName?: string;
  isRowSelected?: (row: T) => boolean;
  getRowAccentClassName?: (row: T) => string | undefined;
  getRowClassName?: (row: T) => string | undefined;
  skeletonRows?: number;
  /** Persist show/hide + reorder for this table (localStorage). */
  columnLayoutKey?: string;
}

/** Shared table shell used by Surveys, Roles, Voices, etc. */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  isLoading,
  emptyIcon = Inbox,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your filters or search term.",
  emptyAction,
  footerHint,
  minWidthClassName = "min-w-215",
  isRowSelected,
  getRowAccentClassName,
  getRowClassName,
  skeletonRows = 5,
  columnLayoutKey,
}: DataTableProps<T>) {
  const layoutItems = useMemo<TableColumnLayoutItem[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        label: columnLabelFromHeader(column.id, column.header, column.label),
        hideable: column.hideable,
        pin: column.pin,
      })),
    [columns]
  );
  const layoutEnabled = Boolean(columnLayoutKey);
  const {
    layout,
    pickerItems,
    hidden,
    toggleHidden,
    reorder,
    reset,
    lockedIds,
  } = useTableColumnLayout(columnLayoutKey ?? "", layoutItems, layoutEnabled);

  const visibleColumns = useMemo(
    () =>
      layoutEnabled
        ? applyColumnLayout(
            columns,
            layout,
            (column) => column.id,
            (column) =>
              resolveColumnPin(
                column,
                columns[0]?.id,
                columns[0]?.id === "select" ? columns[1]?.id : undefined
              )
          )
        : columns,
    [columns, layout, layoutEnabled]
  );

  const pickerBar = layoutEnabled ? (
    <TableColumnsBar
      items={pickerItems}
      hidden={hidden}
      onToggle={toggleHidden}
      onReorder={reorder}
      onReset={reset}
    />
  ) : null;

  if (isLoading) {
    return <DataTableSkeleton columns={columns.length} rows={skeletonRows} />;
  }

  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
        {pickerBar}
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[6px] border border-border/60 bg-card/95 shadow-elevated backdrop-blur-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--brand)_14%,transparent),transparent_55%)]"
      />
      {pickerBar}

      <div className="relative overflow-x-auto">
        <TableColumnDnd
          ids={visibleColumns.map((column) => column.id)}
          lockedIds={lockedIds}
          onReorder={reorder}
          disabled={!layoutEnabled}
        >
          <table className={cn("w-full border-collapse", minWidthClassName)}>
            <thead>
              <tr className={TABLE_HEAD_ROW_CLASS}>
                {visibleColumns.map((column) => (
                  <SortableColumnTh
                    key={column.id}
                    id={column.id}
                    className={cn(
                      column.align === "right" && "text-right",
                      column.id === "select" && TABLE_SELECT_CELL_CLASS,
                      column.headerClassName
                    )}
                  >
                    {column.header}
                  </SortableColumnTh>
                ))}
              </tr>
            </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              const selected = isRowSelected?.(row) ?? false;
              const accent = getRowAccentClassName?.(row);

              const handleRowClick = (
                event: MouseEvent<HTMLTableRowElement>
              ) => {
                if (!onRowClick) return;
                const target = event.target as HTMLElement;
                if (
                  target.closest(
                    "a, button, input, label, [role='checkbox'], [data-row-ignore-click]"
                  )
                ) {
                  return;
                }
                onRowClick(row);
              };

              return (
                <motion.tr
                  key={getRowId(row)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.03, duration: 0.22 }}
                  onClick={onRowClick ? handleRowClick : undefined}
                  className={cn(
                    TABLE_BODY_ROW_CLASS,
                    onRowClick && "cursor-pointer",
                    selected && "bg-primary/5",
                    getRowClassName?.(row)
                  )}
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        TABLE_BODY_CELL_CLASS,
                        column.align === "right" && "text-right",
                        column.id === "select" && TABLE_SELECT_CELL_CLASS,
                        column.cellClassName
                      )}
                    >
                      {column.showAccent && accent ? (
                        <span
                          aria-hidden
                          className={cn(
                            "pointer-events-none absolute inset-y-2 left-0 w-1 rounded-r-full opacity-80 transition-opacity group-hover:opacity-100",
                            accent
                          )}
                        />
                      ) : null}
                      {column.cell(row, rowIndex)}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        </TableColumnDnd>
      </div>

      {footerHint ? (
        <div className="border-t border-border/40 bg-muted/20 px-5 py-2.5">
          <p className="text-[11px] text-muted-foreground">{footerHint}</p>
        </div>
      ) : null}
    </div>
  );
}

export function DataTableSkeleton({
  columns = 5,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-[6px] border border-border/60 bg-card shadow-card">
      <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border/30 px-4 py-4 last:border-0"
        >
          <Skeleton className="size-10 rounded-[8px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          {Array.from({ length: Math.max(columns - 2, 1) }).map((_, j) => (
            <Skeleton key={j} className="h-5 w-16 rounded-md" />
          ))}
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/** One-line cell text — expands only when the user clicks Read more. */
export function TableReadMore({
  text,
  limit = 32,
  className,
}: {
  text: string;
  limit?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const value = text.trim() || "—";
  const needsMore = value.length > limit;

  return (
    <div className={cn("min-w-0 max-w-[14rem]", className)}>
      <p
        className={cn(
          "text-sm leading-5 text-foreground",
          !expanded && "truncate"
        )}
        title={!expanded ? value : undefined}
      >
        {expanded || !needsMore
          ? value
          : `${value.slice(0, limit).trimEnd()}…`}
      </p>
      {needsMore ? (
        <button
          type="button"
          data-row-ignore-click
          onClick={() => setExpanded((open) => !open)}
          className="mt-0.5 text-[11px] font-semibold text-primary hover:underline"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

/** Primary cell: optional icon + title + subtitle */
export function DataTablePrimaryCell({
  icon,
  title,
  subtitle,
  selected,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  selected?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {icon ? (
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[8px] ring-1 transition-colors",
            selected
              ? "bg-brand/15 text-brand ring-brand/25"
              : "bg-muted/70 text-foreground/80 ring-border/50 group-hover:bg-brand/10 group-hover:text-brand group-hover:ring-brand/20"
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <p
          className="truncate font-display text-[15px] font-semibold tracking-tight text-foreground"
          title={title}
        >
          {title}
        </p>
        {subtitle ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function DataTableMetaChip({
  icon: Icon,
  label,
  tabular,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  tabular?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-35 items-center gap-1.5 rounded-full bg-muted/45 px-2.5 py-1 text-xs font-medium text-foreground/80 ring-1 ring-border/40",
        tabular && "tabular-nums",
        className
      )}
      title={label}
    >
      {Icon ? (
        <Icon className="size-3 shrink-0 text-muted-foreground" aria-hidden />
      ) : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

export function DataTableActionGroup({ children }: { children: ReactNode }) {
  return (
    <div
      className="inline-flex h-8 items-center gap-0.5 rounded-[6px] border border-border/50 bg-muted/30 p-0.5 shadow-subtle backdrop-blur-sm transition-all duration-200 group-hover:border-border/80 group-hover:bg-card group-hover:shadow-card"
      data-row-ignore-click
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function DataTableActionDivider() {
  return <span aria-hidden className="mx-0.5 h-4 w-px bg-border/70" />;
}

/** Sortable column header button — same style in Users and other modules */
export function DataTableSortHeader({
  label,
  sorted,
  onToggle,
}: {
  label: string;
  sorted?: false | "asc" | "desc";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="size-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ArrowUpDown className="size-3.5 opacity-40" />
      )}
    </button>
  );
}

type ActionTone = "sky" | "emerald" | "amber" | "teal" | "danger" | "brand";

const ACTION_TONE: Record<ActionTone, string> = {
  sky: "text-sky-700 hover:bg-sky-500/12 hover:text-sky-800 hover:ring-sky-500/20",
  emerald:
    "text-emerald-700 hover:bg-emerald-500/12 hover:text-emerald-800 hover:ring-emerald-500/20",
  amber:
    "text-amber-700 hover:bg-amber-500/12 hover:text-amber-800 hover:ring-amber-500/20",
  teal: "text-teal-700 hover:bg-teal-500/12 hover:text-teal-800 hover:ring-teal-500/20",
  danger:
    "text-red-600 hover:bg-red-500/12 hover:text-red-700 hover:ring-red-500/20",
  brand: "text-brand hover:bg-brand/12 hover:text-brand hover:ring-brand/20",
};

export function DataTableActionButton({
  label,
  children,
  onClick,
  href,
  tone = "sky",
  className,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: ActionTone;
  className?: string;
}) {
  const classes = cn(
    "size-7 rounded-[5px] text-muted-foreground/80 transition-all duration-150",
    "hover:scale-105 hover:ring-1 active:scale-95",
    ACTION_TONE[tone],
    className
  );

  if (href) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={classes}
        asChild
        aria-label={label}
        title={label}
      >
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={classes}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}
