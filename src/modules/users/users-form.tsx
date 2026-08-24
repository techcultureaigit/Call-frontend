"use client";

/**
 * users-form.tsx
 * Create / edit user form.
 * Route: /users/new, /users/[id]/edit
 *
 * API calls in this file:
 *   createUser() → POST /api/users
 *   updateUser() → PATCH /api/users/:id
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { FormPageHeader } from "@/components/shared/form-page-header";
import { usePageMeta } from "@/hooks";
import { createUser, updateUser } from "./api";
import type { UserFormValues } from "./users-validator";
import { isSuperAdminRole } from "@/types/role";
import type { User } from "@/types/user";
import { UserForm } from "./users-form-fields";

interface UsersCreateEditViewProps {
  user?: User;
}

export function UsersCreateEditView({ user }: UsersCreateEditViewProps) {
  const router = useRouter();
  const isEdit = Boolean(user);
  const [isSaving, setIsSaving] = useState(false);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: isEdit ? "Edit User" : "Create User",
    breadcrumbs: [
      { label: "Management", href: "/users" },
      { label: "Users", href: "/users" },
      { label: isEdit ? "Edit" : "Create" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, isEdit]);

  useEffect(() => {
    if (isEdit && user && isSuperAdminRole(user.roleName || user.role)) {
      toast.error("Super Admin cannot be edited");
      router.replace("/users");
    }
  }, [isEdit, user, router]);

  const handleSubmit = useCallback(
    async (values: UserFormValues) => {
      setIsSaving(true);
      try {
        if (isEdit && user) {
          const { password: _pw, ...rest } = values;
          // API: updateUser() → PATCH /api/users/:id
          await updateUser(user.id, rest);
          toast.success("User updated successfully");
        } else {
          // API: createUser() → POST /api/users
          await createUser({
            ...values,
            password: values.password || "",
          });
          toast.success("User created successfully");
        }
        router.push("/users");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save user"
        );
      } finally {
        setIsSaving(false);
      }
    },
    [isEdit, user, router]
  );

  if (isEdit && user && isSuperAdminRole(user.roleName || user.role)) {
    return null;
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
          backHref="/users"
          backLabel="Back to users"
          title={isEdit ? "Edit User" : "Create User"}
          description={
            isEdit
              ? "Update user details and permissions."
              : "Add a new team member to the platform."
          }
        />

        <UserForm
          user={user}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/users")}
          isLoading={isSaving}
        />
      </motion.div>
    </PageContainer>
  );
}

/** Route: /users/new — create user */
export function UsersCreateView() {
  return <UsersCreateEditView />;
}

/** @deprecated Use UsersCreateEditView */
export const UserFormView = UsersCreateEditView;
