"use client";

import { useMemo, type ReactNode } from "react";
import { Cpu, Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  DataTableActionButton,
  DataTableActionDivider,
  DataTableActionGroup,
  DataTableMetaChip,
  DataTablePrimaryCell,
  TABLE_CHIP_CLASS,
  TABLE_STATUS_BADGE_CLASS,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { cn } from "@/lib/utils";
import { PROVIDER_TYPE_LABEL, providerLabel, type ProviderItem } from "./provider-types";

interface ProviderTableProps {
  items: ProviderItem[];
  onEdit: (item: ProviderItem) => void;
  onDelete: (item: ProviderItem) => void;
  isLoading?: boolean;
  embedded?: boolean;
  onColumnsControlReady?: (control: ReactNode | null) => void;
}

export function ProviderTable({
  items,
  onEdit,
  onDelete,
  isLoading,
  embedded = false,
  onColumnsControlReady,
}: ProviderTableProps) {
  const columns = useMemo<DataTableColumn<ProviderItem>[]>(
    () => [
      {
        id: "type",
        header: "Type",
        showAccent: true,
        hideable: false,
        pin: "start",
        cell: (row) => (
          <span className={cn(TABLE_STATUS_BADGE_CLASS, "bg-muted px-2 py-1 text-foreground")}>
            {PROVIDER_TYPE_LABEL[row.type]}
          </span>
        ),
      },
      {
        id: "displayName",
        header: "Display name",
        cell: (row) => (
          <DataTablePrimaryCell
            icon={<Cpu className="size-4" />}
            title={providerLabel(row) || "—"}
          />
        ),
      },
      {
        id: "name",
        header: "Provider name",
        cell: (row) => (
          <span className="text-xs font-medium text-foreground">
            {row.name || row.provider || "—"}
          </span>
        ),
      },
      {
        id: "models",
        header: "Models",
        cell: (row) => (
          <div className="flex max-w-md flex-wrap gap-1.5">
            {row.models.slice(0, 5).map((m) => (
              <span
                key={m.id || m.name}
                className={cn(TABLE_CHIP_CLASS, "bg-muted/70 px-2 py-0.5")}
              >
                {m.name}
              </span>
            ))}
            {row.models.length > 5 ? (
              <span className="text-[11px] text-muted-foreground">
                +{row.models.length - 5}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        id: "count",
        header: "Count",
        cell: (row) => (
          <DataTableMetaChip
            label={String(row.modelCount ?? row.models.length)}
            tabular
          />
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (row) =>
          row.active !== false && row.isActive !== false ? (
            <span className="text-xs font-medium text-emerald-600">Active</span>
          ) : (
            <span className="text-xs text-muted-foreground">Inactive</span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        align: "right",
        hideable: false,
        pin: "end",
        cell: (row) => (
          <DataTableActionGroup>
            <DataTableActionButton
              label="Edit"
              onClick={() => onEdit(row)}
              tone="emerald"
            >
              <Pencil className="size-3.5" />
            </DataTableActionButton>
            <DataTableActionDivider />
            <DataTableActionButton
              label="Delete"
              onClick={() => onDelete(row)}
              tone="danger"
            >
              <Trash2 className="size-3.5" />
            </DataTableActionButton>
          </DataTableActionGroup>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <DataTable
      embedded={embedded}
      columnLayoutKey="providers"
      columns={columns}
      data={items}
      getRowId={(row) => row.id}
      onRowClick={onEdit}
      isLoading={isLoading}
      emptyIcon={Cpu}
      emptyTitle="No providers found"
      emptyDescription="Add a provider with its models."
      footerHint="Type tells which pipeline stage this provider belongs to."
      minWidthClassName="min-w-[52rem]"
      skeletonRows={4}
      onColumnsControlReady={onColumnsControlReady}
    />
  );
}
