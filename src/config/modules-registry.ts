/**
 * Module registry — single source for sidebar navigation and route metadata.
 * Add/remove modules here; navigation and permissions stay in sync.
 */
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  ClipboardList,
  History,
  Inbox,
  LayoutDashboard,
  MessageSquareReply,
  Phone,
  PhoneCall,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  Voicemail,
  Volume2,
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
    id: "surveys",
    items: [
      {
        id: "survey",
        title: "Survey",
        href: "/survey",
        icon: ClipboardList,
        module: "survey",
        description: "Survey module — campaigns and voices.",
        children: [
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
            title: "Voices",
            href: "/library/voices",
            icon: Volume2,
            module: "voices",
            description: "Browse and select survey voices.",
          },
        ],
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        id: "calls",
        title: "Calls",
        href: "/calls",
        icon: Phone,
        module: "calls",
        description: "Monitor live and historical call activity.",
        children: [
          {
            id: "calls-live",
            title: "Live Calls",
            href: "/calls/live",
            icon: PhoneCall,
            module: "calls_live",
            description: "Watch active calls in real time.",
            badge: "Popular",
          },
          {
            id: "calls-history",
            title: "History",
            href: "/calls/history",
            icon: History,
            module: "calls_history",
            description: "Review past call records.",
          },
          {
            id: "calls-recordings",
            title: "Recordings",
            href: "/calls/recordings",
            icon: Voicemail,
            module: "calls_recordings",
            description: "Listen to stored call recordings.",
          },
        ],
      },
      {
        id: "responses",
        title: "Responses",
        href: "/responses",
        icon: MessageSquareReply,
        module: "responses",
        description: "Review inbound replies and flags.",
        children: [
          {
            id: "responses-all",
            title: "All Responses",
            href: "/responses",
            icon: MessageSquareReply,
            module: "responses_all",
            description: "See the full response inbox.",
            badge: "Popular",
          },
          {
            id: "responses-pending",
            title: "Pending",
            href: "/responses/pending",
            icon: Inbox,
            module: "responses_pending",
            description: "Items waiting for follow-up.",
          },
          {
            id: "responses-flagged",
            title: "Flagged",
            href: "/responses/flagged",
            icon: Shield,
            module: "responses_flagged",
            description: "Responses marked for review.",
          },
        ],
      },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      {
        id: "reports",
        title: "Reports",
        href: "/reports",
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
