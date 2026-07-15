export type SettingsSectionId =
  | "profile"
  | "security"
  | "notifications"
  | "appearance"
  | "smtp"
  | "api-keys"
  | "voice-providers"
  | "ai-configuration"
  | "integrations"
  | "system"
  | "audit"
  | "danger-zone";

export interface ProfileSettings {
  avatarUrl?: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  timezone: string;
  language: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessions: ActiveSession[];
  loginHistory: LoginHistoryEntry[];
  trustedDevices: TrustedDevice[];
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  ip: string;
  location: string;
  status: "success" | "failed";
}

export interface TrustedDevice {
  id: string;
  name: string;
  lastUsed: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  campaignAlerts: boolean;
  systemAlerts: boolean;
  aiAlerts: boolean;
}

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "violet" | "blue" | "emerald" | "rose" | "amber";
export type SidebarStyle = "default" | "compact" | "floating";

export interface AppearanceSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  sidebarStyle: SidebarStyle;
  compactMode: boolean;
}

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: "tls" | "ssl" | "none";
  connected: boolean;
}

export interface ApiKeyEntry {
  provider: "openai" | "twilio" | "exotel" | "azure" | "aws";
  label: string;
  maskedKey: string;
  fullKey: string;
  lastRotated: string;
  status: "active" | "expired";
}

export interface VoiceProviderSettings {
  defaultProvider: string;
  languages: string[];
  voiceId: string;
  speechSpeed: number;
  speechPitch: number;
  connected: boolean;
}

export interface AiConfigurationSettings {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  conversationMemory: boolean;
  responseStyle: string;
  retryCount: number;
  fallbackModel: string;
}

export interface IntegrationEntry {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  lastSync?: string;
}

export interface SystemSettings {
  applicationName: string;
  companyLogoUrl?: string;
  timezone: string;
  defaultLanguage: string;
  backupSchedule: string;
  maintenanceMode: boolean;
}

export interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  section: string;
  timestamp: string;
}

export interface AppSettings {
  profile: ProfileSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  smtp: SmtpSettings;
  apiKeys: ApiKeyEntry[];
  voice: VoiceProviderSettings;
  ai: AiConfigurationSettings;
  integrations: IntegrationEntry[];
  system: SystemSettings;
  audit: AuditLogEntry[];
}
