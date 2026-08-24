"use client";

import { useMemo } from "react";
import { Cpu, Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  DataTableActionButton,
  DataTableActionDivider,
  DataTableActionGroup,
  DataTableMetaChip,
  DataTablePrimaryCell,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { PROVIDER_TYPE_LABEL, providerLabel, type ProviderItem } from "./provider-types";

interface ProviderTableProps {
  items: ProviderItem[];
  onEdit: (item: ProviderItem) => void;
  onDelete: (item: ProviderItem) => void;
  isLoading?: boolean;
}

export function ProviderTable({
  items,
  onEdit,
  onDelete,
  isLoading,
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
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-foreground">
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
          <span className="text-sm font-medium text-foreground">
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
                className="inline-flex items-center rounded-md bg-muted/70 px-2 py-0.5 text-[11px] font-medium"
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
            <span className="text-sm font-medium text-emerald-600">Active</span>
          ) : (
            <span className="text-sm text-muted-foreground">Inactive</span>
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
    />
  );
}
