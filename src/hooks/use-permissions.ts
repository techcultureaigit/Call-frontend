"use client";

import { useCallback } from "react";
import { can, hasModuleAccess, type NavModule } from "@/config/permissions";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores";
import type { PermissionAction } from "@/types/role";

function isPrivilegedRole(roleName?: string | null): boolean {
  const name = roleName?.trim().toLowerCase() ?? "";
  return name === "super admin" || name === "admin";
}

/** Session permission helpers — mirrors backend authorize(module, action) */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const permissions = user?.permissions;
  const { isHydrated, isLoading } = useAuth();

  /** False until cookies + /auth/me have put a user in the store. */
  const isReady = Boolean(isHydrated && !isLoading && user);

  const canDo = useCallback(
    (module: string, action: PermissionAction = "read") => {
      if (isPrivilegedRole(user?.roleName ?? user?.role)) return true;
      return can(permissions, module, action);
    },
    [permissions, user?.roleName, user?.role]
  );

  const canAccess = useCallback(
    (module: NavModule) => {
      if (isPrivilegedRole(user?.roleName ?? user?.role)) return true;
      return hasModuleAccess(permissions, module);
    },
    [permissions, user?.roleName, user?.role]
  );

  return {
    permissions,
    isReady,
    can: canDo,
    canAccess,
    canCreateSurvey: canDo("my_surveys", "create"),
    canUpdateSurvey: canDo("my_surveys", "update"),
    canDeleteSurvey: canDo("my_surveys", "delete"),
    canReadSurvey: canDo("my_surveys", "read"),
  };
}
