import type { AppSettings } from "@/types/settings";

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

function daysAgo(d: number) {
  return new Date(Date.now() - d * 86400000).toISOString();
}

export const DEFAULT_SETTINGS: AppSettings = {
  profile: {
    avatarUrl: undefined,
    fullName: "Sarah Chen",
    email: "sarah.chen@acmecorp.com",
    phone: "+1 (415) 555-0142",
    company: "Acme Corporation",
    jobTitle: "VP of Customer Experience",
    timezone: "America/New_York",
    language: "en",
  },
  security: {
    twoFactorEnabled: true,
    sessions: [
      {
        id: "sess_1",
        device: "Chrome on macOS",
        location: "New York, US",
        ip: "192.168.1.42",
        lastActive: hoursAgo(0),
        current: true,
      },
      {
        id: "sess_2",
        device: "Safari on iPhone",
        location: "New York, US",
        ip: "10.0.0.18",
        lastActive: hoursAgo(4),
        current: false,
      },
      {
        id: "sess_3",
        device: "Firefox on Windows",
        location: "Chicago, US",
        ip: "172.16.0.5",
        lastActive: daysAgo(2),
        current: false,
      },
    ],
    loginHistory: [
      {
        id: "log_1",
        timestamp: hoursAgo(1),
        ip: "192.168.1.42",
        location: "New York, US",
        status: "success",
      },
      {
        id: "log_2",
        timestamp: hoursAgo(8),
        ip: "10.0.0.18",
        location: "New York, US",
        status: "success",
      },
      {
        id: "log_3",
        timestamp: daysAgo(1),
        ip: "203.0.113.45",
        location: "Unknown",
        status: "failed",
      },
    ],
    trustedDevices: [
      { id: "dev_1", name: "MacBook Pro", lastUsed: hoursAgo(0) },
      { id: "dev_2", name: "iPhone 15 Pro", lastUsed: hoursAgo(4) },
    ],
  },
  notifications: {
    email: true,
    sms: false,
    push: true,
    campaignAlerts: true,
    systemAlerts: true,
    aiAlerts: true,
  },
  appearance: {
    theme: "system",
    accentColor: "violet",
    sidebarStyle: "default",
    compactMode: false,
  },
  smtp: {
    host: "smtp.sendgrid.net",
    port: 587,
    username: "apikey",
    password: "••••••••••••••••",
    encryption: "tls",
    connected: true,
  },
  apiKeys: [
    {
      provider: "openai",
      label: "OpenAI",
      maskedKey: "sk-••••••••••••3k9f",
      fullKey: "sk-proj-a8f2k9m3n7p1q4r6s8t0u2v4w6x8y0z3k9f",
      lastRotated: daysAgo(14),
      status: "active",
    },
    {
      provider: "twilio",
      label: "Twilio",
      maskedKey: "AC••••••••••••8f2a",
      fullKey: "AC8f2a4b6c8d0e2f4a6b8c0d2e4f6a8f2a",
      lastRotated: daysAgo(30),
      status: "active",
    },
    {
      provider: "exotel",
      label: "Exotel",
      maskedKey: "ex••••••••••••7b1c",
      fullKey: "ex7b1c3d5e7f9a1b3c5d7e9f1a3b5c7b1c",
      lastRotated: daysAgo(45),
      status: "active",
    },
    {
      provider: "azure",
      label: "Azure",
      maskedKey: "az••••••••••••4d8e",
      fullKey: "az4d8e0f2a4b6c8d0e2f4a6b8c0d2e4d8e",
      lastRotated: daysAgo(60),
      status: "active",
    },
    {
      provider: "aws",
      label: "AWS",
      maskedKey: "AK••••••••••••9x3m",
      fullKey: "AKIA9x3m5n7p9r1s3u5w7y9a1c3e5g7i9x3m",
      lastRotated: daysAgo(21),
      status: "active",
    },
  ],
  voice: {
    defaultProvider: "elevenlabs",
    languages: ["en", "es", "hi"],
    voiceId: "rachel-pro",
    speechSpeed: 1.0,
    speechPitch: 1.0,
    connected: true,
  },
  ai: {
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 4096,
    conversationMemory: true,
    responseStyle: "professional",
    retryCount: 3,
    fallbackModel: "gpt-4o-mini",
  },
  integrations: [
    {
      id: "slack",
      name: "Slack",
      description: "Send campaign alerts and AI insights to Slack channels",
      connected: true,
      lastSync: hoursAgo(2),
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Automate workflows with 5,000+ apps",
      connected: false,
    },
    {
      id: "webhook",
      name: "Webhook",
      description: "Push real-time events to your endpoints",
      connected: true,
      lastSync: hoursAgo(1),
    },
    {
      id: "crm",
      name: "CRM Sync",
      description: "Bidirectional sync with Salesforce & HubSpot",
      connected: true,
      lastSync: hoursAgo(6),
    },
    {
      id: "sheets",
      name: "Google Sheets",
      description: "Export responses and analytics to spreadsheets",
      connected: false,
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      description: "Collaborate on campaign reviews in Teams",
      connected: false,
    },
  ],
  system: {
    applicationName: "Acme Voice CRM",
    companyLogoUrl: undefined,
    timezone: "America/New_York",
    defaultLanguage: "en",
    backupSchedule: "daily-2am",
    maintenanceMode: false,
  },
  audit: [
    {
      id: "aud_1",
      user: "Sarah Chen",
      action: "Updated SMTP configuration",
      section: "SMTP",
      timestamp: hoursAgo(3),
    },
    {
      id: "aud_2",
      user: "Alex Rivera",
      action: "Rotated OpenAI API key",
      section: "API Keys",
      timestamp: daysAgo(1),
    },
    {
      id: "aud_3",
      user: "Sarah Chen",
      action: "Enabled two-factor authentication",
      section: "Security",
      timestamp: daysAgo(3),
    },
    {
      id: "aud_4",
      user: "Jordan Kim",
      action: "Changed AI model to GPT-4o",
      section: "AI Configuration",
      timestamp: daysAgo(5),
    },
    {
      id: "aud_5",
      user: "Sarah Chen",
      action: "Connected Slack integration",
      section: "Integrations",
      timestamp: daysAgo(7),
    },
  ],
};

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
