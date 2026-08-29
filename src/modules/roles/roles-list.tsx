"use client";

/**
 * roles-list.tsx
 * Roles list page — list, create, edit, delete.
 * Route: /roles
 *
 * API calls in this file:
 *   listRoles()  → GET    /api/roles
 *   deleteRole() → DELETE /api/roles/:id
 */

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { AppLoader } from "@/components/shared/app-loader";
import { ListTableCard } from "@/components/shared/list-table-card";
import { useDebounce, usePageMeta } from "@/hooks";
import type { RoleListItem } from "@/types/role";
import { isProtectedRole } from "@/types/role";
import { deleteRole, listRoles } from "./api";
import { DeleteRoleDialog } from "./roles-dialogs";
import { RolesTable } from "./roles-table";
import { RolesToolbar } from "./roles-toolbar";

/** Route: /roles — list, create, edit, delete */
export function RolesListView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [columnsControl, setColumnsControl] = useState<ReactNode | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      // API: listRoles() → GET /api/roles
      const data = await listRoles(debouncedSearch);
      setRoles(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load roles"
      );
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Roles",
    breadcrumbs: [
      { label: "Management", href: "/users" },
      { label: "Roles" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const handleDelete = useCallback(async () => {
    if (!selectedRole) return;
    if (isProtectedRole(selectedRole.name)) return;
    setIsDeleting(true);
    try {
      // API: deleteRole() → DELETE /api/roles/:id
      await deleteRole(selectedRole.id);
      toast.success("Role deleted successfully");
      setDeleteOpen(false);
      setSelectedRole(null);
      await loadRoles();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete role"
      );
    } finally {
      setIsDeleting(false);
    }
  }, [selectedRole, loadRoles]);

  const openCreate = () => router.push("/roles/new");
  const openRole = (role: RoleListItem) =>
    router.push(`/roles/${role.id}/edit`);

  const openDelete = (role: RoleListItem) => {
    if (isProtectedRole(role.name)) return;
    setSelectedRole(role);
    setDeleteOpen(true);
  };

  return (
    <div className="min-w-0 bg-linear-to-b from-brand/5 to-transparent">
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <RolesToolbar
          headerOnly
          search={search}
          onSearchChange={setSearch}
          onCreateClick={openCreate}
          roleCount={roles.length}
        />

        {isLoading ? (
          <AppLoader
            variant="section"
            label="Loading roles"
            hint="Fetching latest data"
          />
        ) : (
          <ListTableCard>
            <RolesToolbar
              filtersOnly
              search={search}
              onSearchChange={setSearch}
              onCreateClick={openCreate}
              columnsControl={columnsControl}
            />
            <RolesTable
              embedded
              roles={roles}
              onOpen={openRole}
              onEdit={openRole}
              onDelete={openDelete}
              isLoading={false}
              onColumnsControlReady={setColumnsControl}
            />
          </ListTableCard>
        )}
      </motion.div>

      <DeleteRoleDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        role={selectedRole}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </PageContainer>
    </div>
  );
}

/** @deprecated Use RolesListView */
export const RolesView = RolesListView;
