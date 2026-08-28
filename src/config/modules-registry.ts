/**
 * Module registry — single source for sidebar navigation and route metadata.
 * Add/remove modules here; navigation and permissions stay in sync.
 */
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  ClipboardList,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  Volume2,
  Cpu,
} from "lucide-react";
import type { NavModule } from "./permissions";

export interface ModuleNavItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  module: NavModule;
  description?: string;
  badge?: string;
  disabled?: boolean;
  external?: boolean;
  variant?: "default" | "cta";
  /** When true, child renders indented under a group header */
  nested?: boolean;
  children?: ModuleNavItem[];
}

export interface ModuleNavSection {
  id: string;
  label?: string;
  items: ModuleNavItem[];
}

/** Registered modules grouped for sidebar sections. */
export const moduleNavSections: ModuleNavSection[] = [
  {
    id: "primary",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        module: "dashboard",
      },
    ],
  },
  {
    id: "automation-center",
    label: "Automation Center",
    items: [
      {
        id: "surveys-main",
        title: "My Surveys",
        href: "/survey",
        icon: ClipboardList,
        module: "my_surveys",
        description: "List, create, edit, and delete surveys.",
      },
      {
        id: "library-voices",
        title: "Voice Sample",
        href: "/library/voices",
        icon: Volume2,
        module: "voices",
        description: "Browse and select survey voices.",
      },
      {
        id: "library-providers",
        title: "Agent Providers",
        href: "/library/providers",
        icon: Cpu,
        module: "providers",
        description: "Type + provider + models for survey speech pipeline.",
      },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      {
        id: "reports",
        title: "Analytics Report",
        href: "/analytics",
        icon: BarChart3,
        module: "reports",
      },
    ],
  },
  {
    id: "management",
    label: "Management",
    items: [
      {
        id: "users",
        title: "Users",
        href: "/users",
        icon: Users,
        module: "users",
      },
      {
        id: "roles",
        title: "Roles",
        href: "/roles",
        icon: ShieldCheck,
        module: "roles",
      },
    ],
  },
  {
    id: "system",
    label: "Configurations",
    items: [
      {
        id: "notifications",
        title: "Notifications",
        href: "/notifications",
        icon: Bell,
        module: "notifications",
      },
      {
        id: "activity-logs",
        title: "Activity Logs",
        href: "/activity-logs",
        icon: ScrollText,
        module: "activity_logs",
      },
      {
        id: "settings",
        title: "Settings",
        href: "/settings",
        icon: Settings,
        module: "settings",
      },
    ],
  },
];

/** Flat list of all registered module nav ids (for validation / tooling). */
export function getRegisteredModuleIds(): string[] {
  const ids: string[] = [];
  for (const section of moduleNavSections) {
    for (const item of section.items) {
      ids.push(item.id);
      item.children?.forEach((child) => ids.push(child.id));
    }
  }
  return ids;
}
