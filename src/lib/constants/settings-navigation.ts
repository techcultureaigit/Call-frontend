import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  Bot,
  ClipboardList,
  Key,
  Mic,
  Palette,
  Plug,
  Server,
  Settings,
  Shield,
  User,
} from "lucide-react";
import type { SettingsSectionId } from "@/types/settings";

export interface SettingsNavItem {
  id: SettingsSectionId;
  label: string;
  icon: LucideIcon;
  description: string;
  helpTooltip: string;
  keywords: string[];
  danger?: boolean;
}

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    description: "Manage your personal information and preferences",
    helpTooltip:
      "Update your profile details, contact information, and regional settings.",
    keywords: ["name", "email", "phone", "avatar", "company", "timezone", "language"],
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Password, 2FA, sessions, and login history",
    helpTooltip:
      "Protect your account with two-factor authentication and session management.",
    keywords: ["password", "2fa", "sessions", "login", "devices", "terminate"],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Email, SMS, push, and alert preferences",
    helpTooltip:
      "Control how and when you receive campaign, system, and AI alerts.",
    keywords: ["email", "sms", "push", "alerts", "campaign", "system", "ai"],
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    description: "Theme, accent colors, and layout preferences",
    helpTooltip:
      "Customize the look and feel of your workspace including dark mode.",
    keywords: ["dark", "light", "theme", "accent", "sidebar", "compact"],
  },
  {
    id: "smtp",
    label: "SMTP",
    icon: Server,
    description: "Email delivery server configuration",
    helpTooltip:
      "Configure outbound email for campaign notifications and reports.",
    keywords: ["smtp", "host", "port", "email", "encryption", "test"],
  },
  {
    id: "api-keys",
    label: "API Keys",
    icon: Key,
    description: "Manage third-party API credentials",
    helpTooltip:
      "Securely store and rotate API keys for OpenAI, Twilio, and cloud providers.",
    keywords: ["openai", "twilio", "exotel", "azure", "aws", "key", "rotate"],
  },
  {
    id: "voice-providers",
    label: "Voice Providers",
    icon: Mic,
    description: "Text-to-speech and voice call settings",
    helpTooltip:
      "Configure default voice provider, language support, and speech parameters.",
    keywords: ["voice", "speech", "language", "pitch", "speed", "preview"],
  },
  {
    id: "ai-configuration",
    label: "AI Configuration",
    icon: Bot,
    description: "AI model and conversation settings",
    helpTooltip:
      "Fine-tune AI provider, model parameters, and conversation behavior.",
    keywords: ["ai", "model", "temperature", "tokens", "memory", "fallback"],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    description: "Connect external tools and services",
    helpTooltip:
      "Link Slack, Zapier, webhooks, CRM systems, and productivity tools.",
    keywords: ["slack", "zapier", "webhook", "crm", "sheets", "teams"],
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    description: "Application-wide configuration",
    helpTooltip:
      "Set organization defaults, branding, backups, and maintenance mode.",
    keywords: ["application", "logo", "backup", "maintenance", "organization"],
  },
  {
    id: "audit",
    label: "Audit",
    icon: ClipboardList,
    description: "Configuration change history",
    helpTooltip:
      "Review who changed what settings and when across your organization.",
    keywords: ["audit", "history", "changes", "log", "filter"],
  },
  {
    id: "danger-zone",
    label: "Danger Zone",
    icon: AlertTriangle,
    description: "Irreversible account and system actions",
    helpTooltip:
      "Destructive actions require confirmation. Proceed with extreme caution.",
    keywords: ["delete", "reset", "organization", "account", "danger"],
    danger: true,
  },
];

export function getSettingsNavItem(id: SettingsSectionId) {
  return SETTINGS_NAV.find((item) => item.id === id);
}
