"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { dashboardNavigation } from "@/config/navigation";
import {
  filterNavigationByPermissions,
  getActiveNavGroupIds,
} from "@/lib/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores";

/** Only Super Admin sees the full sidebar; other roles follow the permission matrix. */
function isSuperAdmin(roleName?: string | null): boolean {
  return roleName?.trim().toLowerCase() === "super admin";
}

export function useNavigation() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { isLoading } = useAuth();

  const navigation = useMemo(() => {
    // Keep full sidebar while session loads — avoids blank nav flash
    if (isLoading || !user) {
      return dashboardNavigation;
    }

    if (isSuperAdmin(user.roleName ?? user.role)) {
      return dashboardNavigation;
    }

    return filterNavigationByPermissions(
      dashboardNavigation,
      user.permissions
    );
  }, [user, isLoading]);

  const activeGroupIds = useMemo(
    () => getActiveNavGroupIds(pathname, navigation),
    [pathname, navigation]
  );

  return {
    navigation,
    activeGroupIds,
    pathname,
  };
}
