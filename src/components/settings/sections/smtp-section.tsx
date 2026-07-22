"use client";

import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SettingsSectionCard } from "../settings-section-card";
import { SettingsField } from "../settings-field";
import { SettingsStatusBadge } from "../settings-status-badge";
import type { SmtpSettings } from "@/types/settings";

interface SmtpSectionProps {
  values: SmtpSettings;
  onChange: (values: SmtpSettings) => void;
}

export function SmtpSection({ values, onChange }: SmtpSectionProps) {
  const update = <K extends keyof SmtpSettings>(key: K, val: SmtpSettings[K]) =>
    onChange({ ...values, [key]: val });

  const sendTest = () => {
    toast.success("Test email sent to " + "sarah.chen@acmecorp.com");
  };

  return (
    <SettingsSectionCard
      title="SMTP Configuration"
      description="Outbound email server for notifications and reports"
      helpTooltip="Configure your SMTP provider for transactional emails. Credentials are encrypted at rest."
      gradient="from-cyan-500/10 to-transparent"
      action={<SettingsStatusBadge connected={values.connected} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="SMTP Host" tooltip="e.g. smtp.sendgrid.net">
          <Input
            value={values.host}
            onChange={(e) => update("host", e.target.value)}
            className="rounded-[6px]"
          />
        </SettingsField>
        <SettingsField label="SMTP Port">
          <Input
            type="number"
            value={values.port}
            onChange={(e) => update("port", Number(e.target.value))}
            className="rounded-[6px]"
          />
        </SettingsField>
        <SettingsField label="Username">
          <Input
            value={values.username}
            onChange={(e) => update("username", e.target.value)}
            className="rounded-[6px]"
          />
        </SettingsField>
        <SettingsField label="Password" tooltip="Stored encrypted">
          <Input
            type="password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            className="rounded-[6px] font-mono"
          />
        </SettingsField>
        <SettingsField label="Encryption">
          <Select
            value={values.encryption}
            onChange={(e) =>
              update("encryption", e.target.value as SmtpSettings["encryption"])
            }
            options={[
              { label: "TLS", value: "tls" },
              { label: "SSL", value: "ssl" },
              { label: "None", value: "none" },
            ]}
            className="rounded-[6px]"
          />
        </SettingsField>
      </div>
      <Button variant="outline" onClick={sendTest} className="rounded-[6px]">
        <Send className="size-3.5" />
        Send Test Email
      </Button>
    </SettingsSectionCard>
  );
}
