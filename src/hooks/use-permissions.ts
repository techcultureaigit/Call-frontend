"use client";

import { useCallback } from "react";
import { can, hasModuleAccess, type NavModule } from "@/config/permissions";
import { useAuthStore } from "@/stores";
import type { PermissionAction } from "@/types/role";

/** Session permission helpers — mirrors backend authorize(module, action) */
export function usePermissions() {
  const permissions = useAuthStore((state) => state.user?.permissions);

  const canDo = useCallback(
    (module: string, action: PermissionAction = "read") =>
      can(permissions, module, action),
    [permissions]
  );

  const canAccess = useCallback(
    (module: NavModule) => hasModuleAccess(permissions, module),
    [permissions]
  );

  return {
    permissions,
    can: canDo,
    canAccess,
    canCreateSurvey: canDo("my_surveys", "create"),
    canUpdateSurvey: canDo("my_surveys", "update"),
    canDeleteSurvey: canDo("my_surveys", "delete"),
    canReadSurvey: canDo("my_surveys", "read"),
  };
}
