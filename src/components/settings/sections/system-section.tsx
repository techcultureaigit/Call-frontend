"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SettingsSectionCard } from "../settings-section-card";
import { SettingsField } from "../settings-field";
import type { SystemSettings } from "@/types/settings";

interface SystemSectionProps {
  values: SystemSettings;
  onChange: (values: SystemSettings) => void;
}

export function SystemSection({ values, onChange }: SystemSectionProps) {
  const logoRef = useRef<HTMLInputElement>(null);
  const update = <K extends keyof SystemSettings>(
    key: K,
    val: SystemSettings[K]
  ) => onChange({ ...values, [key]: val });

  return (
    <SettingsSectionCard
      title="System Configuration"
      description="Organization-wide application settings"
      helpTooltip="These settings affect all users in your organization."
      gradient="from-slate-500/10 to-transparent"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="Application Name">
          <Input
            value={values.applicationName}
            onChange={(e) => update("applicationName", e.target.value)}
            className="rounded-xl"
          />
        </SettingsField>
        <SettingsField label="Company Logo">
          <div className="flex gap-2">
            <Input
              readOnly
              value={values.companyLogoUrl ? "Logo uploaded" : "No logo"}
              className="rounded-xl"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-xl"
              onClick={() => logoRef.current?.click()}
            >
              <Upload className="size-4" />
            </Button>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" />
          </div>
        </SettingsField>
        <SettingsField label="Timezone">
          <Select
            value={values.timezone}
            onChange={(e) => update("timezone", e.target.value)}
            options={[
              { label: "Eastern (US)", value: "America/New_York" },
              { label: "UTC", value: "UTC" },
              { label: "India (IST)", value: "Asia/Kolkata" },
            ]}
            className="rounded-xl"
          />
        </SettingsField>
        <SettingsField label="Default Language">
          <Select
            value={values.defaultLanguage}
            onChange={(e) => update("defaultLanguage", e.target.value)}
            options={[
              { label: "English", value: "en" },
              { label: "Spanish", value: "es" },
              { label: "Hindi", value: "hi" },
            ]}
            className="rounded-xl"
          />
        </SettingsField>
        <SettingsField label="Backup Schedule">
          <Select
            value={values.backupSchedule}
            onChange={(e) => update("backupSchedule", e.target.value)}
            options={[
              { label: "Daily at 2:00 AM", value: "daily-2am" },
              { label: "Weekly (Sunday)", value: "weekly-sun" },
              { label: "Monthly (1st)", value: "monthly-1st" },
            ]}
            className="rounded-xl"
          />
        </SettingsField>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <div>
          <Label className="text-sm font-medium">Maintenance Mode</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Disable access for all users except admins
          </p>
        </div>
        <Switch
          checked={values.maintenanceMode}
          onCheckedChange={(c) => update("maintenanceMode", c)}
        />
      </div>
    </SettingsSectionCard>
  );
}
