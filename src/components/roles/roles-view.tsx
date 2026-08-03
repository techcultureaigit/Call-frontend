"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, Save, Shield } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { sanitizePermissions } from "@/config/permission-modules";
import { useDebounce, usePageMeta, useRoles, useRoleMutations } from "@/hooks";
import { RolesToolbar } from "./roles-toolbar";
import { RoleCardsGrid } from "./role-cards-grid";
import { PermissionMatrix } from "./permission-matrix";
import { DeleteRoleDialog } from "./delete-role-dialog";
import type { RoleListItem, RolePermissions } from "@/types/role";
import {
  canEditRolePermissions,
  isProtectedRole,
  isSuperAdminRole,
} from "@/types/role";

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

  const permissionsEditable = activeRole
    ? canEditRolePermissions(activeRole)
    : false;

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
      setDraftPermissions(sanitizePermissions(activeRole.permissions));
      setPermissionsDirty(false);
    }
  }, [activeRole?.id]);

  const handlePermissionsChange = useCallback(
    (next: RolePermissions) => {
      if (!permissionsEditable) return;
      setDraftPermissions(next);
      setPermissionsDirty(true);
    },
    [permissionsEditable]
  );

  const handleSavePermissions = useCallback(async () => {
    if (!activeRole || !draftPermissions || !permissionsEditable) return;
    await updateRole.mutateAsync({
      id: activeRole.id,
      payload: { permissions: draftPermissions },
    });
    setPermissionsDirty(false);
  }, [activeRole, draftPermissions, permissionsEditable, updateRole]);

  const handleDelete = useCallback(async () => {
    if (!selectedRole) return;
    if (isProtectedRole(selectedRole.name)) return;
    await deleteRole.mutateAsync(selectedRole.id);
    setDeleteOpen(false);
    if (selectedId === selectedRole.id) {
      setSelectedId(null);
    }
    setSelectedRole(null);
  }, [selectedRole, selectedId, deleteRole]);

  const openCreate = () => router.push("/roles/new");
  const openEdit = (role: RoleListItem) =>
    router.push(`/roles/${role.id}/edit`);

  const openDelete = (role: RoleListItem) => {
    if (isProtectedRole(role.name)) return;
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
            description={
              permissionsEditable
                ? `Configure CRUD access for ${activeRole.name}`
                : `View-only access for ${activeRole.name} (full permissions locked)`
            }
            icon={Shield}
            action={
              <div className="flex flex-wrap items-center gap-2">
                {permissionsEditable && permissionsDirty && (
                  <span className="rounded-md bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    Unsaved changes
                  </span>
                )}
                {permissionsEditable ? (
                  <>
                    <Button
                      size="sm"
                      className="rounded-[6px]"
                      onClick={handleSavePermissions}
                      disabled={!permissionsDirty || updateRole.isPending}
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
                      className="rounded-[6px]"
                      onClick={() => openEdit(activeRole)}
                    >
                      Edit role
                    </Button>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                    <Lock className="size-3.5" />
                    Locked
                  </span>
                )}
              </div>
            }
            contentClassName="p-0 pb-0"
            noPadding
            className="overflow-hidden"
          >
            <PermissionMatrix
              permissions={draftPermissions}
              onChange={handlePermissionsChange}
              disabled={!permissionsEditable}
            />
            {isSuperAdminRole(activeRole.name) ? (
              <div className="flex items-start gap-2 border-t border-border/50 bg-muted/20 px-5 py-3">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Super Admin has full access and is locked — view only. Edit
                  Admin or other roles to change permissions.
                </p>
              </div>
            ) : isProtectedRole(activeRole.name) ? (
              <div className="flex items-start gap-2 border-t border-border/50 bg-muted/20 px-5 py-3">
                <Shield className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {activeRole.name} is a system role — permissions can be
                  updated, but it cannot be renamed or deleted.
                </p>
              </div>
            ) : null}
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
