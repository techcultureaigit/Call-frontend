import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Briefcase,
  ClipboardList,
  History,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LineChart,
  Megaphone,
  MessageSquareReply,
  Phone,
  PhoneCall,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  UserSquare2,
  Voicemail,
  Volume2,
  Workflow,
} from "lucide-react";
import type { NavModule } from "./permissions";

export interface NavItemConfig {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  module: NavModule;
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
    label: "Agents",
    items: [
      {
        id: "agents-create",
        title: "Create New",
        href: "/agents/new",
        icon: UserPlus,
        module: "agents",
        variant: "cta",
      },
      {
        id: "agents-templates",
        title: "Survey Template",
        href: "/agents/templates",
        icon: Briefcase,
        module: "agents",
      },
    ],
  },
  {
    id: "library",
    label: "Library",
    items: [
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
    id: "engagement",
    label: "Engagement",
    items: [
      {
        id: "customers",
        title: "Customers",
        href: "/customers",
        icon: UserSquare2,
        module: "customers",
      },
      {
        id: "campaigns",
        title: "Campaigns",
        href: "/campaigns",
        icon: Megaphone,
        module: "campaigns",
        children: [
          {
            id: "campaigns-overview",
            title: "Overview",
            href: "/campaigns",
            icon: LayoutGrid,
            module: "campaigns",
          },
          {
            id: "campaigns-templates",
            title: "Templates",
            href: "/campaigns/templates",
            icon: Sparkles,
            module: "campaigns",
          },
          {
            id: "campaigns-analytics",
            title: "Analytics",
            href: "/campaigns/analytics",
            icon: LineChart,
            module: "campaigns",
          },
        ],
      },
      {
        id: "surveys",
        title: "Surveys",
        href: "/surveys",
        icon: ClipboardList,
        module: "surveys",
        children: [
          {
            id: "surveys-all",
            title: "All Surveys",
            href: "/surveys",
            icon: ClipboardList,
            module: "surveys",
          },
          {
            id: "surveys-builder",
            title: "Builder",
            href: "/surveys/builder",
            icon: Workflow,
            module: "surveys",
          },
          {
            id: "surveys-results",
            title: "Results",
            href: "/surveys/results",
            icon: BarChart3,
            module: "surveys",
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
        children: [
          {
            id: "calls-live",
            title: "Live Calls",
            href: "/calls/live",
            icon: PhoneCall,
            module: "calls",
          },
          {
            id: "calls-history",
            title: "History",
            href: "/calls/history",
            icon: History,
            module: "calls",
          },
          {
            id: "calls-recordings",
            title: "Recordings",
            href: "/calls/recordings",
            icon: Voicemail,
            module: "calls",
          },
        ],
      },
      {
        id: "responses",
        title: "Responses",
        href: "/responses",
        icon: MessageSquareReply,
        module: "responses",
        children: [
          {
            id: "responses-all",
            title: "All Responses",
            href: "/responses",
            icon: MessageSquareReply,
            module: "responses",
          },
          {
            id: "responses-pending",
            title: "Pending Review",
            href: "/responses/pending",
            icon: History,
            module: "responses",
          },
          {
            id: "responses-flagged",
            title: "Flagged",
            href: "/responses/flagged",
            icon: Shield,
            module: "responses",
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
    id: "system",
    label: "System",
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
  campaigns: {
    root: "/campaigns",
    templates: "/campaigns/templates",
    analytics: "/campaigns/analytics",
  },
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
