import {
  moduleNavSections,
  type ModuleNavItem,
  type ModuleNavSection,
} from "./modules-registry";

/** @deprecated use ModuleNavItem from modules-registry */
export type NavItemConfig = ModuleNavItem;

/** @deprecated use ModuleNavSection from modules-registry */
export type NavSection = ModuleNavSection;

/** Sidebar navigation — built from module registry. */
export const dashboardNavigation: ModuleNavSection[] = moduleNavSections;

export const authNavigation = {
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
} as const;

export const routePaths = {
  home: "/",
  dashboard: "/dashboard",
  survey: {
    root: "/survey",
    new: "/survey/new",
    actions: "/survey/actions",
  },
  library: {
    voices: "/library/voices",
    providers: "/library/providers",
  },
  users: "/users",
  roles: "/roles",
  analytics: "/analytics",
  /** @deprecated use analytics — kept for legacy links */
  reports: "/analytics",
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
