"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { FormPageHeader } from "@/components/shared/form-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta, useUserMutations } from "@/hooks";
import { useUserDetail } from "@/hooks/use-users";
import type { UserFormValues } from "@/lib/validators/user";
import { UserForm } from "./user-form";

interface UserFormViewProps {
  userId?: string;
}

export function UserFormView({ userId }: UserFormViewProps) {
  const router = useRouter();
  const isEdit = Boolean(userId);
  const { data: user, isLoading } = useUserDetail(userId ?? null);
  const { createUser, updateUser } = useUserMutations();

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

  const handleSubmit = useCallback(
    async (values: UserFormValues) => {
      if (isEdit && userId) {
        await updateUser.mutateAsync({ id: userId, payload: values });
      } else {
        await createUser.mutateAsync(values);
      }
      router.push("/users");
    },
    [isEdit, userId, updateUser, createUser, router]
  );

  if (isEdit && isLoading) {
    return (
      <PageContainer size="full">
        <div className="w-full space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-[420px] w-full rounded-[6px]" />
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
          isLoading={createUser.isPending || updateUser.isPending}
        />
      </motion.div>
    </PageContainer>
  );
}
