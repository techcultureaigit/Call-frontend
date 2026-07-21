"use client";

import { useMemo } from "react";
import type { NavItemConfig, NavSection } from "@/config/navigation";
import { useNavigation } from "@/hooks";
import { useSidebarStore } from "@/stores";
import { NavGroup } from "./nav-group";
import { NavItem } from "./nav-item";
import { SidebarSectionLabel } from "./sidebar-section-label";

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
  const allNavHrefs = useMemo(
    () => collectNavHrefs(navigation),
    [navigation]
  );

  let navIndex = 0;

  return (
    <nav className="space-y-5">
      {navigation.map((section, sectionIndex) => (
        <div key={section.id} className="space-y-1">
          {section.label && !collapsed && (
            <SidebarSectionLabel label={section.label} />
          )}
          {section.label && collapsed && sectionIndex > 0 && (
            <div className="mx-auto my-2 flex flex-col items-center gap-1">
              <span className="nav-active-gradient size-1 rounded-full" />
              <div className="h-px w-5 bg-[#f3f0f0]/15" />
            </div>
          )}
          <ul className="space-y-0.5">
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
