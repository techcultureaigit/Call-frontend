"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { dashboardNavigation } from "@/config/navigation";
import {
  filterNavigationByPermissions,
  getActiveNavGroupIds,
} from "@/lib/navigation";
import { useAuthStore } from "@/stores";

export function useNavigation() {
  const pathname = usePathname();
  const permissions = useAuthStore((state) => state.user?.permissions);

  const navigation = useMemo(
    () => filterNavigationByPermissions(dashboardNavigation, permissions),
    [permissions]
  );

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
