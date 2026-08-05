"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { useDebounce, usePageMeta, useRoles, useRoleMutations } from "@/hooks";
import { RolesToolbar } from "./roles-toolbar";
import { RolesTable } from "./roles-table";
import { DeleteRoleDialog } from "./delete-role-dialog";
import type { RoleListItem } from "@/types/role";
import { isProtectedRole } from "@/types/role";

export function RolesView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleListItem | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data: roles = [], isLoading } = useRoles(debouncedSearch);
  const { deleteRole } = useRoleMutations();

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
    await deleteRole.mutateAsync(selectedRole.id);
    setDeleteOpen(false);
    setSelectedRole(null);
  }, [selectedRole, deleteRole]);

  const openCreate = () => router.push("/roles/new");
  const openRole = (role: RoleListItem) =>
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

        <RolesTable
          roles={roles}
          onOpen={openRole}
          onEdit={openRole}
          onDelete={openDelete}
          isLoading={isLoading}
        />
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
