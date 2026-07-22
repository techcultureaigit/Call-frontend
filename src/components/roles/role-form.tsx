"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEmptyPermissions } from "@/config/permission-modules";
import {
  roleFormSchema,
  type RoleFormValues,
} from "@/lib/validators/role";
import { PermissionMatrix } from "./permission-matrix";
import type { Role, RolePermissions } from "@/types/role";

interface RoleFormProps {
  role?: Role | null;
  onSubmit: (
    values: RoleFormValues,
    permissions: RolePermissions
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const defaultValues: RoleFormValues = {
  name: "",
  description: "",
};

export function RoleForm({
  role,
  onSubmit,
  onCancel,
  isLoading,
}: RoleFormProps) {
  const isEdit = Boolean(role);
  const [permissions, setPermissions] = useState<RolePermissions>(
    createEmptyPermissions()
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(
      role
        ? {
            name: role.name,
            description: role.description,
          }
        : defaultValues
    );
    setPermissions(role?.permissions ?? createEmptyPermissions());
  }, [role, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values, permissions);
  });

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full space-y-6 rounded-[6px] border border-border/60 bg-card shadow-card"
    >
      <div className="space-y-5 p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="role-name">Role name</Label>
            <Input
              id="role-name"
              {...register("name")}
              placeholder="e.g. Campaign Manager"
              disabled={role?.isSystem}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="role-description">Description</Label>
            <Input
              id="role-description"
              {...register("description")}
              placeholder="Brief description of this role's purpose"
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Permissions</Label>
          <PermissionMatrix permissions={permissions} onChange={setPermissions} />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border/60 px-6 py-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Save changes" : "Create role"}
        </Button>
      </div>
    </form>
  );
}
