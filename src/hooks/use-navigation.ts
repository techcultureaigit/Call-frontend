"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { dashboardNavigation } from "@/config/navigation";
import {
  filterNavigationByRole,
  getActiveNavGroupIds,
} from "@/lib/navigation";
import { useAuth } from "@/hooks";

export function useNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navigation = useMemo(
    () => filterNavigationByRole(dashboardNavigation, user?.role),
    [user?.role]
  );

  const activeGroupIds = useMemo(
    () => getActiveNavGroupIds(pathname, navigation),
    [pathname, navigation]
  );

  return {
    navigation,
    activeGroupIds,
    pathname,
    role: user?.role,
  };
}
