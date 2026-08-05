"use client";

import { AppLoaderSpinner } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RoleListItem } from "@/types/role";
import { isProtectedRole, isSuperAdminRole } from "@/types/role";

interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleListItem | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
  onConfirm,
  isLoading,
}: DeleteRoleDialogProps) {
  if (!role) return null;

  const blocked = isProtectedRole(role.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete role</DialogTitle>
          <DialogDescription>
            {isSuperAdminRole(role.name) ? (
              <>
                <span className="font-medium text-foreground">{role.name}</span>{" "}
                cannot be deleted.
              </>
            ) : blocked ? (
              <>
                System role{" "}
                <span className="font-medium text-foreground">{role.name}</span>{" "}
                cannot be deleted.
              </>
            ) : (
              <>
                Are you sure you want to delete the{" "}
                <span className="font-medium text-foreground">{role.name}</span>{" "}
                role?
                {role.userCount > 0 ? (
                  <span className="mt-2 block text-destructive">
                    This role has {role.userCount} assigned users and cannot be
                    deleted.
                  </span>
                ) : (
                  " Users assigned to this role will lose their permissions."
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading || role.userCount > 0 || blocked}
          >
            {isLoading && <AppLoaderSpinner size="sm" className="mr-1" />}
            Delete role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
