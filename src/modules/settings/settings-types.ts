/**
 * settings-types.ts — Settings module types (no API calls).
 */
export type {
  AppSettings,
  SettingsSectionId,
  ProfileSettings,
  SecuritySettings,
  NotificationSettings,
  AppearanceSettings,
  SmtpSettings,
  ApiKeyEntry,
  VoiceProviderSettings,
  AiConfigurationSettings,
  IntegrationEntry,
  SystemSettings,
  AuditLogEntry,
} from "@/types/settings";

export interface SaveSettingsInput {
  settings: import("@/types/settings").AppSettings;
}
