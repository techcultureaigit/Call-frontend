"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppLoaderSpinner } from "@/components/ui/app-loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createEmptyPermissions, sanitizePermissions } from "@/config/permission-modules";
import {
  roleFormSchema,
  type RoleFormValues,
} from "@/lib/validators/role";
import { PermissionMatrix } from "./permission-matrix";
import type { Role, RolePermissions } from "@/types/role";
import { canEditRolePermissions, isProtectedRole } from "@/types/role";

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSubmit: (
    values: RoleFormValues,
    permissions: RolePermissions
  ) => Promise<void>;
  isLoading?: boolean;
}

const defaultValues: RoleFormValues = {
  name: "",
  description: "",
};

export function RoleFormModal({
  open,
  onOpenChange,
  role,
  onSubmit,
  isLoading,
}: RoleFormModalProps) {
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
    if (open) {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate on open / role switch only
  }, [open, role?.id, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    if (formLocked) return;
    await onSubmit(values, permissions);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border/60 px-6 py-5">
          <DialogTitle>
            {formLocked ? "View Role" : isEdit ? "Edit Role" : "Create Role"}
          </DialogTitle>
          <DialogDescription>
            {formLocked
              ? "Super Admin has full access and is locked â€” view only."
              : isEdit
                ? "Update role details and configure module permissions."
                : "Define a new role with granular CRUD permissions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </ScrollArea>

          <DialogFooter className="shrink-0 border-t border-border/60 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {formLocked ? "Close" : "Cancel"}
            </Button>
            {!formLocked && (
              <Button type="submit" disabled={isLoading}>
                {isLoading && <AppLoaderSpinner size="sm" className="mr-1" />}
                {isEdit ? "Save changes" : "Create role"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
