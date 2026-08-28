"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { isRouteActive } from "@/lib/navigation";
import { SidebarNavContent, sidebarRowClass } from "./sidebar-styles";

interface NavSubItemProps {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  pathname: string;
  siblingHrefs: string[];
  onNavigate?: () => void;
}

export function NavSubItem({
  id,
  title,
  href,
  icon,
  pathname,
  siblingHrefs,
  onNavigate,
}: NavSubItemProps) {
  const isActive = isRouteActive(pathname, href, siblingHrefs);

  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className={sidebarRowClass(isActive, { nested: true })}
        aria-current={isActive ? "page" : undefined}
      >
        <SidebarNavContent
          icon={icon}
          label={title}
          isActive={isActive}
        />
      </Link>
    </li>
  );
}
