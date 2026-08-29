"use client";

/**
 * Reusable table column visibility + reorder (DRY).
 * Layout is saved per logged-in user in the DB (not localStorage).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ColumnDef, HeaderGroup } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { TOOLBAR_OUTLINE_CONTROL_CLASS } from "@/components/shared/toolbar-styles";
import {
  loadTableColumnPrefs,
  saveTableColumnPref,
} from "@/components/shared/table-column-prefs";

export interface TableColumnLayoutItem {
  id: string;
  label: string;
  /** Default true. Select / actions should be false. */
  hideable?: boolean;
  /** Keep at table start or end regardless of drag order. */
  pin?: "start" | "end";
}

export interface TableColumnLayoutState {
  order: string[];
  hidden: string[];
}

function humanizeColumnId(id: string) {
  return id
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function columnLabelFromHeader(
  id: string,
  header: ReactNode,
  explicit?: string
) {
  if (explicit?.trim()) return explicit.trim();
  if (typeof header === "string" && header.trim()) return header.trim();
  return humanizeColumnId(id) || id;
}

/**
 * Fixed columns (never drag):
 * - first column
 * - checkbox `select` (and the next identity column after it)
 * - `actions` at the end
 */
export function lockedColumnIds(originalIds: string[]): string[] {
  const locked: string[] = [];
  const first = originalIds[0];
  if (first) locked.push(first);
  if (first === "select" && originalIds[1]) {
    locked.push(originalIds[1]);
  }
  if (originalIds.includes("select") && !locked.includes("select")) {
    locked.push("select");
  }
  if (originalIds.includes("actions") && first !== "actions") {
    locked.push("actions");
  }
  return locked;
}

export function resolveColumnPin(
  item: Pick<TableColumnLayoutItem, "id" | "pin">,
  firstId?: string,
  identityId?: string
): "start" | "end" | null {
  if (item.pin) return item.pin;
  if (item.id === "select") return "start";
  if (firstId && item.id === firstId) return "start";
  if (identityId && item.id === identityId) return "start";
  if (item.id === "actions" && item.id !== firstId) return "end";
  return null;
}

function withLeadingColumnsPinned(
  items: TableColumnLayoutItem[]
): TableColumnLayoutItem[] {
  if (items.length === 0) return items;
  const locked = new Set(lockedColumnIds(items.map((item) => item.id)));
  return items.map((item) => {
    if (!locked.has(item.id) || item.pin === "end") return item;
    if (item.id === "actions") return item;
    return item.pin === "start" ? item : { ...item, pin: "start" as const };
  });
}

function isHideable(item: TableColumnLayoutItem) {
  if (item.hideable === false) return false;
  if (resolveColumnPin(item)) return false;
  return true;
}

function mergeLayout(
  items: TableColumnLayoutItem[],
  stored: TableColumnLayoutState | null
): TableColumnLayoutState {
  const ids = items.map((item) => item.id);
  const idSet = new Set(ids);
  const order = [
    ...(stored?.order ?? []).filter((id) => idSet.has(id)),
    ...ids.filter((id) => !stored?.order?.includes(id)),
  ];
  const hidden = (stored?.hidden ?? []).filter((id) => {
    if (!idSet.has(id)) return false;
    const item = items.find((row) => row.id === id);
    return item ? isHideable(item) : false;
  });
  return { order, hidden };
}

export function applyColumnLayout<T>(
  columns: T[],
  layout: TableColumnLayoutState,
  getId: (column: T) => string,
  getPin?: (column: T) => "start" | "end" | null
): T[] {
  const originalIds = columns.map(getId);
  const firstId = originalIds[0];
  const identityId =
    firstId === "select" && originalIds[1] ? originalIds[1] : undefined;
  const locked = new Set(lockedColumnIds(originalIds));
  const byId = new Map(columns.map((column) => [getId(column), column]));
  const start: T[] = [];
  const end: T[] = [];
  const middleIds: string[] = [];

  for (const column of columns) {
    const id = getId(column);
    const pin =
      getPin?.(column) || resolveColumnPin({ id }, firstId, identityId);
    const lockEnd = locked.has(id) && pin === "end";
    const lockStart = locked.has(id) && !lockEnd;
    if (lockStart || pin === "start") start.push(column);
    else if (lockEnd || pin === "end") end.push(column);
    else middleIds.push(id);
  }

  const hidden = new Set(layout.hidden);
  const orderedMiddle: T[] = [];
  for (const id of layout.order) {
    if (!middleIds.includes(id) || hidden.has(id)) continue;
    const column = byId.get(id);
    if (column) orderedMiddle.push(column);
  }
  for (const id of middleIds) {
    if (hidden.has(id)) continue;
    if (orderedMiddle.some((column) => getId(column) === id)) continue;
    const column = byId.get(id);
    if (column) orderedMiddle.push(column);
  }

  return [...start, ...orderedMiddle, ...end];
}

export function useTableColumnLayout(
  storageKey: string,
  items: TableColumnLayoutItem[],
  enabled = true
) {
  const pinnedItems = useMemo(() => withLeadingColumnsPinned(items), [items]);
  const itemsKey = pinnedItems.map((item) => item.id).join("|");
  const [layout, setLayout] = useState<TableColumnLayoutState>(() =>
    mergeLayout(pinnedItems, null)
  );

  useEffect(() => {
    if (!enabled || !storageKey) {
      setLayout(mergeLayout(pinnedItems, null));
      return;
    }
    let cancelled = false;
    void loadTableColumnPrefs().then((map) => {
      if (cancelled) return;
      setLayout(mergeLayout(pinnedItems, map[storageKey] ?? null));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, enabled, itemsKey]);

  const persist = useCallback(
    (next: TableColumnLayoutState) => {
      setLayout(next);
      if (enabled && storageKey) saveTableColumnPref(storageKey, next);
    },
    [enabled, storageKey]
  );

  const reset = useCallback(() => {
    const next = { order: pinnedItems.map((item) => item.id), hidden: [] };
    persist(next);
  }, [pinnedItems, persist]);

  const toggleHidden = useCallback(
    (id: string, hide: boolean) => {
      const item = pinnedItems.find((row) => row.id === id);
      if (!item || !isHideable(item)) return;

      const visibleHideable = pinnedItems.filter(
        (row) =>
          isHideable(row) &&
          (hide
            ? row.id !== id && !layout.hidden.includes(row.id)
            : !layout.hidden.includes(row.id) || row.id === id)
      );
      if (hide && visibleHideable.length === 0) return;

      persist({
        ...layout,
        hidden: hide
          ? [...layout.hidden.filter((value) => value !== id), id]
          : layout.hidden.filter((value) => value !== id),
      });
    },
    [pinnedItems, layout, persist]
  );

  const reorder = useCallback(
    (activeId: string, overId: string) => {
      if (activeId === overId) return;
      const locked = new Set(
        lockedColumnIds(pinnedItems.map((item) => item.id))
      );
      if (locked.has(activeId) || locked.has(overId)) return;
      const current = layout.order.length
        ? layout.order
        : pinnedItems.map((item) => item.id);
      const oldIndex = current.indexOf(activeId);
      const newIndex = current.indexOf(overId);
      if (oldIndex < 0 || newIndex < 0) return;
      persist({ ...layout, order: arrayMove(current, oldIndex, newIndex) });
    },
    [pinnedItems, layout, persist]
  );

  const pickerItems = useMemo(() => {
    const byId = new Map(pinnedItems.map((item) => [item.id, item]));
    const ordered = [
      ...layout.order
        .map((id) => byId.get(id))
        .filter((item): item is TableColumnLayoutItem => Boolean(item)),
      ...pinnedItems.filter((item) => !layout.order.includes(item.id)),
    ];
    const start = ordered.filter((item) => resolveColumnPin(item) === "start");
    const end = ordered.filter((item) => resolveColumnPin(item) === "end");
    const middle = ordered.filter((item) => !resolveColumnPin(item));
    return [...start, ...middle, ...end];
  }, [pinnedItems, layout.order]);

  const lockedIds = useMemo(
    () => lockedColumnIds(pinnedItems.map((item) => item.id)),
    [pinnedItems]
  );

  return {
    layout,
    pickerItems,
    hidden: layout.hidden,
    toggleHidden,
    reorder,
    reset,
    enabled: enabled && Boolean(storageKey),
    lockedIds,
  };
}

function ColumnPickerRowShell({
  children,
  dragging,
}: {
  children: ReactNode;
  dragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[6px] border border-border/50 bg-card px-2 py-1.5",
        dragging && "z-10 border-brand/40 shadow-card"
      )}
    >
      {children}
    </div>
  );
}

function ColumnPickerRowContent({
  item,
  checked,
  onToggle,
  grip,
}: {
  item: TableColumnLayoutItem;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  grip: ReactNode;
}) {
  const hideable = isHideable(item);
  return (
    <>
      {grip}
      <Checkbox
        checked={checked}
        disabled={!hideable}
        onChange={(e) => onToggle(e.target.checked)}
        aria-label={`Show ${item.label}`}
      />
      <span className="min-w-0 truncate text-[13px] font-medium text-foreground">
        {item.label}
      </span>
    </>
  );
}

function PinnedColumnPickerRow({
  item,
  checked,
  onToggle,
}: {
  item: TableColumnLayoutItem;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <ColumnPickerRowShell>
      <ColumnPickerRowContent
        item={item}
        checked={checked}
        onToggle={onToggle}
        grip={
          <span className="flex size-7 shrink-0 items-center justify-center text-muted-foreground/40">
            <GripVertical className="size-3.5" />
          </span>
        }
      />
    </ColumnPickerRowShell>
  );
}

function SortableColumnRow({
  item,
  checked,
  onToggle,
}: {
  item: TableColumnLayoutItem;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <ColumnPickerRowShell dragging={isDragging}>
        <ColumnPickerRowContent
          item={item}
          checked={checked}
          onToggle={onToggle}
          grip={
            <button
              type="button"
              className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
              aria-label={`Reorder ${item.label}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-3.5" />
            </button>
          }
        />
      </ColumnPickerRowShell>
    </div>
  );
}

function ColumnPickerRow({
  item,
  checked,
  onToggle,
}: {
  item: TableColumnLayoutItem;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  if (resolveColumnPin(item)) {
    return (
      <PinnedColumnPickerRow
        item={item}
        checked={checked}
        onToggle={onToggle}
      />
    );
  }
  return (
    <SortableColumnRow item={item} checked={checked} onToggle={onToggle} />
  );
}

export function TableColumnsButton({
  items,
  hidden,
  onToggle,
  onReorder,
  onReset,
  className,
}: {
  items: TableColumnLayoutItem[];
  hidden: string[];
  onToggle: (id: string, hide: boolean) => void;
  onReorder: (activeId: string, overId: string) => void;
  onReset: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);
  const sortableIds = useMemo(
    () => items.filter((item) => !resolveColumnPin(item)).map((item) => item.id),
    [items]
  );
  const locked = useMemo(
    () =>
      new Set(
        items.filter((item) => Boolean(resolveColumnPin(item))).map((item) => item.id)
      ),
    [items]
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleDragEnd = (event: DragEndEvent) => {
    const overId = event.over?.id;
    if (!overId) return;
    const activeId = String(event.active.id);
    const targetId = String(overId);
    if (locked.has(activeId) || locked.has(targetId)) return;
    onReorder(activeId, targetId);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(TOOLBAR_OUTLINE_CONTROL_CLASS, className)}
      >
        <Columns3 className="size-4" />
        Columns
      </Button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,28rem)] rounded-[10px] border border-border/70 bg-popover p-3 text-popover-foreground shadow-elevated">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Show columns
            </p>
            <button
              type="button"
              onClick={onReset}
              className="text-[12px] font-semibold text-brand hover:underline"
            >
              Reset
            </button>
          </div>
          <p className="mb-3 text-[11px] text-muted-foreground">
            Drag rows to reorder table columns.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortableIds}
              strategy={rectSortingStrategy}
            >
              <div className="grid max-h-80 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
                {items.map((item) => (
                  <ColumnPickerRow
                    key={item.id}
                    item={item}
                    checked={!hiddenSet.has(item.id)}
                    onToggle={(checked) => onToggle(item.id, !checked)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : null}
    </div>
  );
}

/** Shared header / cell spacing — every list table uses these. */
export const TABLE_FONT_CLASS = "font-sans text-xs leading-snug";
export const TABLE_STATUS_BADGE_CLASS =
  "inline-flex items-center rounded-[6px] font-sans text-[10px] font-medium leading-snug";
export const TABLE_CHIP_CLASS =
  "inline-flex items-center rounded-[6px] font-sans text-[11px] font-medium leading-snug";
export const TABLE_PRIMARY_TEXT_CLASS =
  "truncate font-sans text-xs font-medium leading-snug text-foreground";
export const TABLE_SUBTEXT_CLASS =
  "mt-0.5 line-clamp-1 font-sans text-[11px] leading-snug text-muted-foreground";
export const TABLE_HEAD_ROW_CLASS =
  "border-b border-border/50 bg-card";
export const TABLE_HEAD_CELL_CLASS =
  "px-3 py-2 text-left font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground";
export const TABLE_BODY_ROW_CLASS =
  "group border-b border-border/30 transition-colors last:border-0 hover:bg-muted/25";
export const TABLE_BODY_CELL_CLASS =
  "relative px-3 py-2 align-middle font-sans text-xs leading-snug text-foreground";
export const TABLE_SELECT_CELL_CLASS = "w-10 px-2.5";

const ColumnLockContext = createContext<Set<string>>(new Set());

export function TableColumnDnd({
  ids,
  lockedIds,
  onReorder,
  disabled = false,
  children,
}: {
  ids: string[];
  lockedIds: string[];
  onReorder: (activeId: string, overId: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const locked = useMemo(() => new Set(lockedIds), [lockedIds]);
  const sortableIds = useMemo(
    () => ids.filter((id) => !locked.has(id)),
    [ids, locked]
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  if (disabled) {
    return (
      <ColumnLockContext.Provider value={new Set(ids)}>
        {children}
      </ColumnLockContext.Provider>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const overId = event.over?.id;
    if (!overId) return;
    const activeId = String(event.active.id);
    const targetId = String(overId);
    if (locked.has(activeId) || locked.has(targetId)) return;
    onReorder(activeId, targetId);
  };

  return (
    <ColumnLockContext.Provider value={locked}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableIds}
          strategy={horizontalListSortingStrategy}
        >
          {children}
        </SortableContext>
      </DndContext>
    </ColumnLockContext.Provider>
  );
}

export function SortableColumnTh({
  id,
  disabled = false,
  className,
  children,
}: {
  id: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const lockedIds = useContext(ColumnLockContext);
  const locked = disabled || lockedIds.has(id);
  if (locked) {
    return (
      <th className={cn(TABLE_HEAD_CELL_CLASS, className)}>
        <span className="inline-flex items-center gap-1.5">
          <span className="min-w-0">{children}</span>
        </span>
      </th>
    );
  }
  return (
    <DraggableColumnTh id={id} className={className}>
      {children}
    </DraggableColumnTh>
  );
}

function DraggableColumnTh({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <th
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        TABLE_HEAD_CELL_CLASS,
        "cursor-grab select-none active:cursor-grabbing",
        isDragging && "z-20 bg-card shadow-card ring-1 ring-brand/30",
        className
      )}
      {...attributes}
      {...listeners}
    >
      <span className="inline-flex items-center gap-1.5">
        <GripVertical
          className="size-3 shrink-0 text-muted-foreground/50"
          aria-hidden
        />
        <span className="min-w-0">{children}</span>
      </span>
    </th>
  );
}

export function SortableTanstackHeaderRow<T>({
  headerGroup,
}: {
  headerGroup: HeaderGroup<T>;
}) {
  return (
    <tr className={TABLE_HEAD_ROW_CLASS}>
      {headerGroup.headers.map((header) => {
        const canSort = header.column.getCanSort();
        const sorted = header.column.getIsSorted();
        return (
          <SortableColumnTh key={header.id} id={header.column.id}>
            {header.isPlaceholder ? null : canSort ? (
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
          </SortableColumnTh>
        );
      })}
    </tr>
  );
}

export function getColumnDefId<T>(column: ColumnDef<T>): string {
  if (column.id) return column.id;
  if ("accessorKey" in column && typeof column.accessorKey === "string") {
    return column.accessorKey;
  }
  return "";
}

type ColumnDefMeta = {
  label?: string;
  hideable?: boolean;
  pin?: "start" | "end";
};

export function useLaidOutColumnDefs<T>(
  storageKey: string,
  columns: ColumnDef<T>[]
) {
  const items = useMemo<TableColumnLayoutItem[]>(
    () =>
      columns.map((column) => {
        const id = getColumnDefId(column);
        const meta = (column.meta ?? {}) as ColumnDefMeta;
        const header =
          typeof column.header === "string" ? column.header : undefined;
        return {
          id,
          label: columnLabelFromHeader(id, header, meta.label),
          hideable: meta.hideable,
          pin: meta.pin,
        };
      }),
    [columns]
  );

  const layoutApi = useTableColumnLayout(storageKey, items, Boolean(storageKey));

  const firstColumnId = columns[0] ? getColumnDefId(columns[0]) : undefined;
  const identityColumnId =
    firstColumnId === "select" && columns[1]
      ? getColumnDefId(columns[1])
      : undefined;

  const visibleColumns = useMemo(
    () =>
      applyColumnLayout(
        columns,
        layoutApi.layout,
        getColumnDefId,
        (column) => {
          const meta = (column.meta ?? {}) as ColumnDefMeta;
          return resolveColumnPin(
            { id: getColumnDefId(column), pin: meta.pin },
            firstColumnId,
            identityColumnId
          );
        }
      ),
    [columns, layoutApi.layout, firstColumnId, identityColumnId]
  );

  return { ...layoutApi, visibleColumns, firstColumnId };
}

export function TableColumnsBar({
  items,
  hidden,
  onToggle,
  onReorder,
  onReset,
}: {
  items: TableColumnLayoutItem[];
  hidden: string[];
  onToggle: (id: string, hide: boolean) => void;
  onReorder: (activeId: string, overId: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="relative z-20 flex items-center justify-end border-b border-border/40 bg-card px-3 py-2">
      <TableColumnsButton
        items={items}
        hidden={hidden}
        onToggle={onToggle}
        onReorder={onReorder}
        onReset={onReset}
      />
    </div>
  );
}
