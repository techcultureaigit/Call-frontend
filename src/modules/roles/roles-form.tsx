"use client";

/**
 * roles-form.tsx
 * Create / edit role form.
 * Route: /roles/new, /roles/[id]/edit
 *
 * API calls in this file:
 *   createRole() → POST  /api/roles
 *   updateRole() → PATCH /api/roles/:id
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { FormPageHeader } from "@/components/shared/form-page-header";
import { usePageMeta } from "@/hooks";
import { createRole, updateRole } from "./api";
import type { RoleFormValues } from "./roles-validator";
import type { Role, RolePermissions } from "@/types/role";
import { canEditRolePermissions } from "@/types/role";
import { RoleForm } from "./roles-form-fields";

interface RolesCreateEditViewProps {
  role?: Role;
}

export function RolesCreateEditView({ role }: RolesCreateEditViewProps) {
  const router = useRouter();
  const isEdit = Boolean(role);
  const [isSaving, setIsSaving] = useState(false);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: isEdit ? "Edit Role" : "Create Role",
    breadcrumbs: [
      { label: "Management", href: "/roles" },
      { label: "Roles", href: "/roles" },
      { label: isEdit ? "Edit" : "Create" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, isEdit]);

  const handleSubmit = useCallback(
    async (values: RoleFormValues, permissions: RolePermissions) => {
      setIsSaving(true);
      try {
        if (isEdit && role) {
          // API: updateRole() → PATCH /api/roles/:id
          await updateRole(role.id, { ...values, permissions });
          toast.success("Role updated successfully");
        } else {
          // API: createRole() → POST /api/roles
          await createRole({ ...values, permissions });
          toast.success("Role created successfully");
        }
        router.push("/roles");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save role"
        );
      } finally {
        setIsSaving(false);
      }
    },
    [isEdit, role, router]
  );

  return (
    <PageContainer size="full">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full space-y-6"
      >
        <FormPageHeader
          backHref="/roles"
          backLabel="Back to roles"
          title={
            isEdit && role && !canEditRolePermissions(role)
              ? "View Role"
              : isEdit
                ? "Edit Role"
                : "Create Role"
          }
          description={
            isEdit && role && !canEditRolePermissions(role)
              ? "Super Admin has full access and is locked — view only."
              : isEdit
                ? "Update role details and configure module permissions."
                : "Define a new role with granular CRUD permissions."
          }
        />

        <RoleForm
          role={role}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/roles")}
          isLoading={isSaving}
        />
      </motion.div>
    </PageContainer>
  );
}

/** Route: /roles/new — create role */
export function RolesCreateView() {
  return <RolesCreateEditView />;
}

/** @deprecated Use RolesCreateEditView */
export const RoleFormView = RolesCreateEditView;
