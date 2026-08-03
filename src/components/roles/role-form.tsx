"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEmptyPermissions, sanitizePermissions } from "@/config/permission-modules";
import {
  roleFormSchema,
  type RoleFormValues,
} from "@/lib/validators/role";
import { PermissionMatrix } from "./permission-matrix";
import type { Role, RolePermissions } from "@/types/role";
import { canEditRolePermissions, isProtectedRole } from "@/types/role";

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
  const nameLocked = role ? isProtectedRole(role.name) : false;
  const permissionsLocked = role ? !canEditRolePermissions(role) : false;
  const formLocked = permissionsLocked;
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
    setPermissions(
      role?.permissions
        ? sanitizePermissions(role.permissions)
        : createEmptyPermissions()
    );
    // Only re-hydrate when switching roles — not on every parent re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: role.id
  }, [role?.id, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    if (formLocked) return;
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
              disabled={nameLocked || formLocked}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
            {permissionsLocked ? (
              <p className="text-xs text-muted-foreground">
                Super Admin is locked with full access — view only.
              </p>
            ) : nameLocked ? (
              <p className="text-xs text-muted-foreground">
                System role name is fixed. You can still add or change
                permissions below.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Permissions</Label>
          <PermissionMatrix
            permissions={permissions}
            onChange={setPermissions}
            disabled={permissionsLocked}
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border/60 px-6 py-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {formLocked ? "Back" : "Cancel"}
        </Button>
        {!formLocked && (
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create role"}
          </Button>
        )}
      </div>
    </form>
  );
}
