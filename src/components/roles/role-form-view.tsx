"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { FormPageHeader } from "@/components/shared/form-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta, useRoleMutations } from "@/hooks";
import { useRoleDetail } from "@/hooks/use-roles";
import type { RoleFormValues } from "@/lib/validators/role";
import type { RolePermissions } from "@/types/role";
import { RoleForm } from "./role-form";

interface RoleFormViewProps {
  roleId?: string;
}

export function RoleFormView({ roleId }: RoleFormViewProps) {
  const router = useRouter();
  const isEdit = Boolean(roleId);
  const { data: role, isLoading } = useRoleDetail(roleId ?? null);
  const { createRole, updateRole } = useRoleMutations();

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
      if (isEdit && roleId) {
        await updateRole.mutateAsync({
          id: roleId,
          payload: { ...values, permissions },
        });
      } else {
        await createRole.mutateAsync({
          ...values,
          permissions,
        });
      }
      router.push("/roles");
    },
    [isEdit, roleId, updateRole, createRole, router]
  );

  if (isEdit && isLoading) {
    return (
      <PageContainer size="full">
        <div className="w-full space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-[560px] w-full rounded-[6px]" />
        </div>
      </PageContainer>
    );
  }

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
          title={isEdit ? "Edit Role" : "Create Role"}
          description={
            isEdit
              ? "Update role details and configure module permissions."
              : "Define a new role with granular CRUD permissions."
          }
        />

        <RoleForm
          role={role}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/roles")}
          isLoading={createRole.isPending || updateRole.isPending}
        />
      </motion.div>
    </PageContainer>
  );
}
