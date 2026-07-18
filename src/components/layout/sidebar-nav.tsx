"use client";

import { useEffect, useMemo } from "react";
import type { NavItemConfig, NavSection } from "@/config/navigation";
import { useNavigation } from "@/hooks";
import { useSidebarStore } from "@/stores";
import { NavGroup } from "./nav-group";
import { NavItem } from "./nav-item";

function collectNavHrefs(sections: NavSection[]): string[] {
  return sections.flatMap((section) =>
    section.items.flatMap((item) => [
      item.href,
      ...(item.children?.map((child) => child.href) ?? []),
    ])
  );
}

interface SidebarNavProps {
  collapsed: boolean;
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const { navigation, activeGroupIds, pathname } = useNavigation();
  const closeMobile = useSidebarStore((state) => state.closeMobile);
  const setExpandedGroups = useSidebarStore((state) => state.setExpandedGroups);
  const expandedGroups = useSidebarStore((state) => state.expandedGroups);
  const allNavHrefs = useMemo(
    () => collectNavHrefs(navigation),
    [navigation]
  );

  useEffect(() => {
    if (activeGroupIds.length === 0) return;

    const nextGroups = { ...expandedGroups };
    let changed = false;

    activeGroupIds.forEach((groupId) => {
      if (!nextGroups[groupId]) {
        nextGroups[groupId] = true;
        changed = true;
      }
    });

    if (changed) {
      setExpandedGroups(nextGroups);
    }
  }, [activeGroupIds, expandedGroups, setExpandedGroups]);

  let navIndex = 0;

  return (
    <nav className="space-y-8">
      {navigation.map((section, sectionIndex) => (
        <div key={section.id}>
          {section.label && !collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35">
              {section.label}
            </p>
          )}
          {section.label && collapsed && sectionIndex > 0 && (
            <div className="mx-auto mb-3 h-px w-6 bg-sidebar-border/40" />
          )}
          <ul className="space-y-1">
            {section.items.map((item) => {
              const currentIndex = navIndex++;
              return (
                <li key={item.id}>
                  <SidebarNavEntry
                    item={item}
                    collapsed={collapsed}
                    pathname={pathname}
                    siblingHrefs={allNavHrefs}
                    activeGroupIds={activeGroupIds}
                    index={currentIndex}
                    onNavigate={closeMobile}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

interface SidebarNavEntryProps {
  item: NavItemConfig;
  collapsed: boolean;
  pathname: string;
  siblingHrefs: string[];
  activeGroupIds: string[];
  index: number;
  onNavigate: () => void;
}

function SidebarNavEntry({
  item,
  collapsed,
  pathname,
  siblingHrefs,
  activeGroupIds,
  index,
  onNavigate,
}: SidebarNavEntryProps) {
  if (item.children?.length) {
    return (
      <NavGroup
        item={item}
        collapsed={collapsed}
        activeGroupIds={activeGroupIds}
        index={index}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <NavItem
      id={item.id}
      title={item.title}
      href={item.href}
      icon={item.icon}
      badge={item.badge}
      disabled={item.disabled}
      external={item.external}
      variant={item.variant}
      collapsed={collapsed}
      pathname={pathname}
      siblingHrefs={siblingHrefs}
      index={index}
      onNavigate={onNavigate}
    />
  );
}
