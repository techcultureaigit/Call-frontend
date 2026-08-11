"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { AppLoader } from "@/components/shared/app-loader";
import { useDebounce, usePageMeta } from "@/hooks";
import {
  createProvider,
  deleteProvider,
  listProviders,
  updateProvider,
} from "./api";
import { ProviderFormDialog, DeleteProviderDialog } from "./provider-dialogs";
import { ProviderTable } from "./provider-table";
import { ProviderToolbar } from "./provider-toolbar";
import type { ProviderFormValues, ProviderItem, ProviderType } from "./provider-types";

export function ProvidersListView() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ProviderType | "all">("all");
  const [items, setItems] = useState<ProviderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProviderItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<ProviderItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await listProviders({
        type: type === "all" ? undefined : type,
        search: debouncedSearch || undefined,
      });
      setItems(rows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, type]);

  useEffect(() => {
    void load();
  }, [load]);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Providers",
    breadcrumbs: [
      { label: "Survey", href: "/survey" },
      { label: "Providers" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const modelCount = useMemo(
    () => items.reduce((sum, row) => sum + (row.models?.length ?? 0), 0),
    [items]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: ProviderItem) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSave = async (values: ProviderFormValues) => {
    setIsSaving(true);
    try {
      if (editing) {
        await updateProvider(editing.id, values);
        toast.success("Provider updated");
      } else {
        await createProvider(values);
        toast.success("Provider created");
      }
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteProvider(deleting.id);
      toast.success("Provider deleted");
      setDeleteOpen(false);
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <ProviderToolbar
          search={search}
          onSearchChange={setSearch}
          type={type}
          onTypeChange={setType}
          onCreateClick={openCreate}
          count={items.length}
          modelCount={modelCount}
        />

        {isLoading ? (
          <AppLoader variant="section" label="Loading" hint="Fetching providers" />
        ) : null}

        {items.length > 0 || !isLoading ? (
          <ProviderTable
            items={items}
            onEdit={openEdit}
            onDelete={(row) => {
              setDeleting(row);
              setDeleteOpen(true);
            }}
          />
        ) : null}
      </motion.div>

      <ProviderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editing}
        onSubmit={handleSave}
        isLoading={isSaving}
      />

      <DeleteProviderDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        item={deleting}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}
