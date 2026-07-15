"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Save, Shield } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { useDebounce, usePageMeta, useRoles, useRoleMutations } from "@/hooks";
import { RolesToolbar } from "./roles-toolbar";
import { RoleCardsGrid } from "./role-cards-grid";
import { PermissionMatrix } from "./permission-matrix";
import { DeleteRoleDialog } from "./delete-role-dialog";
import type { RoleListItem, RolePermissions } from "@/types/role";

export function RolesView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] =
    useState<RolePermissions | null>(null);
  const [permissionsDirty, setPermissionsDirty] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleListItem | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data: roles = [], isLoading, isFetching } = useRoles(debouncedSearch);
  const { updateRole, deleteRole } = useRoleMutations();

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Roles",
    breadcrumbs: [
      { label: "Management", href: "/users" },
      { label: "Roles" },
    ],
  });

  const activeRole = useMemo(
    () => roles.find((role) => role.id === selectedId) ?? null,
    [roles, selectedId]
  );

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    if (roles.length > 0 && !selectedId) {
      setSelectedId(roles[0].id);
    }
  }, [roles, selectedId]);

  useEffect(() => {
    if (activeRole) {
      setDraftPermissions(structuredClone(activeRole.permissions));
      setPermissionsDirty(false);
    }
  }, [activeRole?.id]);

  const handlePermissionsChange = useCallback(
    (next: RolePermissions) => {
      setDraftPermissions(next);
      setPermissionsDirty(true);
    },
    []
  );

  const handleSavePermissions = useCallback(async () => {
    if (!activeRole || !draftPermissions) return;
    await updateRole.mutateAsync({
      id: activeRole.id,
      payload: { permissions: draftPermissions },
    });
    setPermissionsDirty(false);
  }, [activeRole, draftPermissions, updateRole]);

  const handleDelete = useCallback(async () => {
    if (!selectedRole) return;
    await deleteRole.mutateAsync(selectedRole.id);
    setDeleteOpen(false);
    if (selectedId === selectedRole.id) {
      setSelectedId(null);
    }
    setSelectedRole(null);
  }, [selectedRole, selectedId, deleteRole]);

  const openCreate = () => router.push("/roles/new");
  const openEdit = (role: RoleListItem) => router.push(`/roles/${role.id}/edit`);

  const openDelete = (role: RoleListItem) => {
    setSelectedRole(role);
    setDeleteOpen(true);
  };

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <RolesToolbar
          search={search}
          onSearchChange={setSearch}
          onCreateClick={openCreate}
          roleCount={roles.length}
        />

        <RoleCardsGrid
          roles={roles}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onEdit={openEdit}
          onDelete={openDelete}
          isLoading={isLoading}
        />

        {activeRole && draftPermissions && !isLoading && (
          <DashboardCard
            title="Permission Matrix"
            description={`Configure CRUD access for ${activeRole.name}`}
            action={
              <div className="flex items-center gap-2">
                {permissionsDirty && (
                  <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    Unsaved changes
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={handleSavePermissions}
                  disabled={
                    !permissionsDirty || updateRole.isPending
                  }
                >
                  {updateRole.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save permissions
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(activeRole)}
                >
                  Edit role
                </Button>
              </div>
            }
            contentClassName="p-0 pb-0"
            noPadding
          >
            <PermissionMatrix
              permissions={draftPermissions}
              onChange={handlePermissionsChange}
              disabled={activeRole.isSystem}
            />
            {activeRole.isSystem && (
              <p className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
                <Shield className="mr-1 inline size-3.5" />
                System role permissions are read-only. Duplicate this role to
                create a customizable copy.
              </p>
            )}
          </DashboardCard>
        )}

        {isFetching && !isLoading && (
          <div className="flex justify-center">
            <div className="size-1.5 animate-pulse rounded-full bg-primary" />
          </div>
        )}
      </motion.div>

      <DeleteRoleDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        role={selectedRole}
        onConfirm={handleDelete}
        isLoading={deleteRole.isPending}
      />
    </PageContainer>
  );
}
