import { hasModuleAccess } from "@/config/permissions";
import type { NavItemConfig, NavSection } from "@/config/navigation";
import type { RolePermissions } from "@/types/role";

/**
 * Filter sidebar navigation by the user's role permission matrix.
 * Parent items stay if they have `read` or any visible children remain.
 */
export function filterNavigationByPermissions(
  navigation: NavSection[],
  permissions?: RolePermissions | null
): NavSection[] {
  if (!permissions) return navigation;

  return navigation
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => filterNavItem(item, permissions))
        .filter((item): item is NavItemConfig => item !== null),
    }))
    .filter((section) => section.items.length > 0);
}

function filterNavItem(
  item: NavItemConfig,
  permissions: RolePermissions
): NavItemConfig | null {
  if (item.children?.length) {
    const children = item.children
      .map((child) => filterNavItem(child, permissions))
      .filter((child): child is NavItemConfig => child !== null);

    const parentAllowed = hasModuleAccess(permissions, item.module);
    if (!parentAllowed && children.length === 0) return null;

    return { ...item, children };
  }

  return hasModuleAccess(permissions, item.module) ? item : null;
}

/** @deprecated use filterNavigationByPermissions */
export const filterNavigationByRole = filterNavigationByPermissions;

export function isRouteActive(
  pathname: string,
  href: string,
  siblingHrefs: string[] = []
): boolean {
  const currentPath = pathname.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  const targetPath = href.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";

  if (currentPath === targetPath) return true;
  if (targetPath === "/dashboard") return false;

  // Keep parent nav active on nested pages (e.g. /roles/[id]/edit, /roles/new)
  const isNested = currentPath.startsWith(`${targetPath}/`);
  if (!isNested) return false;

  const hasMoreSpecificSibling = siblingHrefs.some((sibling) => {
    const siblingPath =
      sibling.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
    return (
      siblingPath !== targetPath &&
      siblingPath.startsWith(`${targetPath}/`) &&
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
  const siblingHrefs = item.children?.map((child) => child.href) ?? [];

  if (isRouteActive(pathname, item.href, siblingHrefs)) return true;

  return (
    item.children?.some((child) =>
      isRouteActive(pathname, child.href, siblingHrefs)
    ) ?? false
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
