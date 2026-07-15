import { authConfig } from "@/config/api";

export const storageKeys = {
  authToken: authConfig.tokenKey,
  refreshToken: authConfig.refreshKey,
  sidebarCollapsed: "crm_sidebar_collapsed",
  theme: "crm_theme",
  tablePreferences: "crm_table_preferences",
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
