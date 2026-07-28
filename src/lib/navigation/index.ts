import type { NavItemConfig, NavSection } from "@/config/navigation";
import type { RolePermissions } from "@/types/role";

/**
 * Role-based filtering is disabled on the frontend for now.
 * Returns full navigation; wire to API permissions later.
 */
export function filterNavigationByPermissions(
  navigation: NavSection[],
  _permissions?: RolePermissions | null
): NavSection[] {
  return navigation;
}

/** @deprecated use filterNavigationByPermissions */
export const filterNavigationByRole = filterNavigationByPermissions;

export function isRouteActive(
  pathname: string,
  href: string,
  siblingHrefs: string[] = []
): boolean {
  const currentPath = pathname.split("?")[0].split("#")[0];
  const targetPath = href.split("?")[0].split("#")[0];

  if (currentPath === targetPath) return true;
  if (targetPath === "/dashboard") return false;

  const isNested = currentPath.startsWith(`${targetPath}/`);
  if (!isNested) return false;

  const hasMoreSpecificSibling = siblingHrefs.some((sibling) => {
    const siblingPath = sibling.split("?")[0].split("#")[0];
    return (
      siblingPath !== targetPath &&
      siblingPath.startsWith(targetPath) &&
      (currentPath === siblingPath ||
        currentPath.startsWith(`${siblingPath}/`))
    );
  });

  return !hasMoreSpecificSibling;
}

export function isNavItemActive(
  pathname: string,
  item: NavItemConfig
): boolean {
  if (isRouteActive(pathname, item.href)) return true;

  return (
    item.children?.some((child) => isNavItemActive(pathname, child)) ?? false
  );
}

export function getActiveNavGroupIds(
  pathname: string,
  navigation: NavSection[]
): string[] {
  const activeIds: string[] = [];

  navigation.forEach((section) => {
    section.items.forEach((item) => {
      if (item.children?.length && isNavItemActive(pathname, item)) {
        activeIds.push(item.id);
      }
    });
  });

  return activeIds;
}
