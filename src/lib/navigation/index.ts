import type { NavItemConfig, NavSection } from "@/config/navigation";
import { hasModuleAccess } from "@/config/permissions";
import type { UserRole } from "@/types/user";

function filterNavItems(
  items: NavItemConfig[],
  role: UserRole | undefined
): NavItemConfig[] {
  return items
    .filter((item) => hasModuleAccess(role, item.module))
    .map((item) => {
      if (!item.children?.length) return item;

      const children = filterNavItems(item.children, role);
      if (children.length === 0) return null;

      return { ...item, children };
    })
    .filter((item): item is NavItemConfig => item !== null);
}

export function filterNavigationByRole(
  navigation: NavSection[],
  role: UserRole | undefined
): NavSection[] {
  return navigation
    .map((section) => ({
      ...section,
      items: filterNavItems(section.items, role),
    }))
    .filter((section) => section.items.length > 0);
}

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
