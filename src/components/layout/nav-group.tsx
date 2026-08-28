"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItemConfig } from "@/config/navigation";
import { isRouteActive } from "@/lib/navigation";
import { NavItem } from "./nav-item";
import { NavSubItem } from "./nav-sub-item";
import { SidebarNavContent, sidebarRowClass } from "./sidebar-styles";

interface NavGroupProps {
  item: NavItemConfig;
  collapsed: boolean;
  activeGroupIds: string[];
  index: number;
  onNavigate?: () => void;
}

/**
 * Inline nav group — section-style parent + always-visible children.
 */
export function NavGroup({
  item,
  collapsed,
  onNavigate,
}: NavGroupProps) {
  const pathname = usePathname();
  const children = item.children ?? [];
  const siblingHrefs = children.map((child) => child.href);
  const Icon = item.icon;
  const isParentActive = isRouteActive(pathname, item.href, siblingHrefs);

  if (collapsed) {
    return (
      <div className="space-y-1">
        <NavItem
          id={item.id}
          title={item.title}
          href={item.href}
          icon={item.icon}
          badge={item.badge}
          disabled={item.disabled}
          external={item.external}
          collapsed
          pathname={pathname}
          siblingHrefs={siblingHrefs}
          onNavigate={onNavigate}
        />
        {children.map((child) => (
          <NavItem
            key={child.id}
            id={child.id}
            title={child.title}
            href={child.href}
            icon={child.icon}
            badge={child.badge}
            disabled={child.disabled}
            external={child.external}
            collapsed
            pathname={pathname}
            siblingHrefs={siblingHrefs}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Link
        href={item.href}
        onClick={onNavigate}
        className={sidebarRowClass(isParentActive, { collapsed: false })}
        aria-current={isParentActive ? "page" : undefined}
      >
        <SidebarNavContent
          icon={Icon}
          label={item.title}
          isActive={isParentActive}
        />
      </Link>

      <ul className="space-y-1">
        {children.map((child) =>
          child.nested ? (
            <NavSubItem
              key={child.id}
              id={child.id}
              title={child.title}
              href={child.href}
              icon={child.icon}
              pathname={pathname}
              siblingHrefs={siblingHrefs}
              onNavigate={onNavigate}
            />
          ) : (
            <li key={child.id}>
              <NavItem
                id={child.id}
                title={child.title}
                href={child.href}
                icon={child.icon}
                badge={child.badge}
                disabled={child.disabled}
                external={child.external}
                collapsed={false}
                pathname={pathname}
                siblingHrefs={siblingHrefs}
                onNavigate={onNavigate}
              />
            </li>
          )
        )}
      </ul>
    </div>
  );
}
