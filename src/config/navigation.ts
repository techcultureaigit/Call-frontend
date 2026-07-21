import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Briefcase,
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
  UserPlus,
  Users,
  UserSquare2,
  Voicemail,
  Volume2,
} from "lucide-react";
import type { NavModule } from "./permissions";

export interface NavItemConfig {
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
  children?: NavItemConfig[];
}

export interface NavSection {
  id: string;
  label?: string;
  items: NavItemConfig[];
}

export const dashboardNavigation: NavSection[] = [
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
    id: "agents",
    label: "Survey Studio",
    items: [
      {
        id: "agents-create",
        title: "Create New",
        href: "/agents/new",
        icon: UserPlus,
        module: "agents",
      },
      {
        id: "agents-templates",
        title: "Survey Template",
        href: "/agents/templates",
        icon: Briefcase,
        module: "agents",
      },
      {
        id: "library-voices",
        title: "Voices",
        href: "/library/voices",
        icon: Volume2,
        module: "library",
      },
      {
        id: "library-audio-buffer",
        title: "Audio Buffer",
        href: "/library/audio-buffer",
        icon: Inbox,
        module: "library",
      },
      {
        id: "customers",
        title: "Survey Data",
        href: "/customers",
        icon: UserSquare2,
        module: "customers",
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
            module: "calls",
            description: "Watch active calls in real time.",
            badge: "Popular",
          },
          {
            id: "calls-history",
            title: "History",
            href: "/calls/history",
            icon: History,
            module: "calls",
            description: "Review past call records.",
          },
          {
            id: "calls-recordings",
            title: "Recordings",
            href: "/calls/recordings",
            icon: Voicemail,
            module: "calls",
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
            module: "responses",
            description: "See the full response inbox.",
            badge: "Popular",
          },
          {
            id: "responses-pending",
            title: "Pending",
            href: "/responses/pending",
            icon: Inbox,
            module: "responses",
            description: "Items waiting for follow-up.",
          },
          {
            id: "responses-flagged",
            title: "Flagged",
            href: "/responses/flagged",
            icon: Shield,
            module: "responses",
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

export const authNavigation = {
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
} as const;

export const routePaths = {
  home: "/",
  dashboard: "/dashboard",
  agents: {
    root: "/agents",
    new: "/agents/new",
    templates: "/agents/templates",
    actions: "/agents/actions",
    telephony: "/agents/telephony",
  },
  library: {
    voices: "/library/voices",
    audioBuffer: "/library/audio-buffer",
  },
  users: "/users",
  roles: "/roles",
  customers: "/customers",
  surveys: {
    root: "/surveys",
    builder: "/surveys/builder",
    results: "/surveys/results",
  },
  calls: {
    root: "/calls",
    live: "/calls/live",
    history: "/calls/history",
    recordings: "/calls/recordings",
  },
  responses: {
    root: "/responses",
    pending: "/responses/pending",
    flagged: "/responses/flagged",
  },
  reports: "/reports",
  callIntel: "/call-intel",
  usage: "/usage",
  billing: "/billing",
  help: "/help",
  notifications: "/notifications",
  activityLogs: "/activity-logs",
  settings: {
    root: "/settings",
    general: "/settings/general",
    integrations: "/settings/integrations",
    security: "/settings/security",
    api: "/settings/api",
    billing: "/settings/billing",
  },
  auth: authNavigation,
} as const;

export type RoutePaths = typeof routePaths;

// Legacy alias for consumers expecting NavItem
export type NavItem = NavItemConfig;
