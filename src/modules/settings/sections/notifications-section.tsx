"use client";

import { SettingsSectionCard } from "../settings-section-card";
import { SettingsToggleRow } from "../settings-toggle-row";
import type { NotificationSettings } from "@/types/settings";

interface NotificationsSectionProps {
  values: NotificationSettings;
  onChange: (values: NotificationSettings) => void;
}

export function NotificationsSection({
  values,
  onChange,
}: NotificationsSectionProps) {
  const update = (key: keyof NotificationSettings, checked: boolean) =>
    onChange({ ...values, [key]: checked });

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="Notification Channels"
        description="Choose how you receive updates"
        helpTooltip="Configure delivery channels for alerts and system messages."
        gradient="from-amber-500/10 to-transparent"
      >
        <div className="space-y-2">
          <SettingsToggleRow
            id="notif-email"
            label="Email Notifications"
            description="Receive updates via email"
            checked={values.email}
            onCheckedChange={(c) => update("email", c)}
          />
          <SettingsToggleRow
            id="notif-sms"
            label="SMS Notifications"
            description="Critical alerts via text message"
            checked={values.sms}
            onCheckedChange={(c) => update("sms", c)}
          />
          <SettingsToggleRow
            id="notif-push"
            label="Push Notifications"
            description="Browser and mobile push alerts"
            checked={values.push}
            onCheckedChange={(c) => update("push", c)}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Alert Types"
        description="Fine-tune what you're notified about"
        helpTooltip="Control campaign, system, and AI-specific alert categories."
        gradient="from-rose-500/10 to-transparent"
      >
        <div className="space-y-2">
          <SettingsToggleRow
            id="notif-campaign"
            label="Campaign Alerts"
            description="Status changes, completions, and failures"
            checked={values.campaignAlerts}
            onCheckedChange={(c) => update("campaignAlerts", c)}
          />
          <SettingsToggleRow
            id="notif-system"
            label="System Alerts"
            description="Maintenance, updates, and security notices"
            checked={values.systemAlerts}
            onCheckedChange={(c) => update("systemAlerts", c)}
          />
          <SettingsToggleRow
            id="notif-ai"
            label="AI Alerts"
            description="Model errors, confidence drops, and anomalies"
            checked={values.aiAlerts}
            onCheckedChange={(c) => update("aiAlerts", c)}
          />
        </div>
      </SettingsSectionCard>
    </div>
  );
}
