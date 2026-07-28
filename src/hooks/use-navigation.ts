"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { dashboardNavigation } from "@/config/navigation";
import { getActiveNavGroupIds } from "@/lib/navigation";

export function useNavigation() {
  const pathname = usePathname();

  // Role-based nav filtering disabled — enable later via API permissions
  const navigation = dashboardNavigation;

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
