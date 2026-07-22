"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { SettingsSectionCard } from "../settings-section-card";
import { SettingsField } from "../settings-field";
import type { ProfileSettings } from "@/types/settings";

const TIMEZONES = [
  { label: "Eastern (US)", value: "America/New_York" },
  { label: "Central (US)", value: "America/Chicago" },
  { label: "Pacific (US)", value: "America/Los_Angeles" },
  { label: "UTC", value: "UTC" },
  { label: "India (IST)", value: "Asia/Kolkata" },
];

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "Hindi", value: "hi" },
];

interface ProfileSectionProps {
  values: ProfileSettings;
  onChange: (values: ProfileSettings) => void;
  errors?: Partial<Record<keyof ProfileSettings, string>>;
}

export function ProfileSection({
  values,
  onChange,
  errors,
}: ProfileSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [first, ...rest] = values.fullName.split(" ");

  const update = (key: keyof ProfileSettings, val: string) =>
    onChange({ ...values, [key]: val });

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({ ...values, avatarUrl: url });
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="Profile Information"
        description="Your public profile and contact details"
        helpTooltip="This information appears on reports, audit logs, and team collaboration features."
        gradient="from-violet-500/10 to-transparent"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="size-20 rounded-[6px] border-2 border-border/50 shadow-card">
                {values.avatarUrl ? (
                  <AvatarImage src={values.avatarUrl} alt={values.fullName} />
                ) : null}
                <AvatarFallback className="rounded-[6px] bg-primary/10 text-lg font-semibold text-primary">
                  {getInitials(first, rest.join(" "))}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute -bottom-1 -right-1 size-8 rounded-lg shadow-card"
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="size-3.5" />
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              JPG, PNG up to 2MB
            </p>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <SettingsField
              label="Full Name"
              htmlFor="fullName"
              tooltip="Your display name across the platform"
              error={errors?.fullName}
            >
              <Input
                id="fullName"
                value={values.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className="rounded-[6px]"
              />
            </SettingsField>
            <SettingsField
              label="Email"
              htmlFor="email"
              tooltip="Primary email for login and notifications"
              error={errors?.email}
            >
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                className="rounded-[6px]"
              />
            </SettingsField>
            <SettingsField label="Phone" htmlFor="phone">
              <Input
                id="phone"
                value={values.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="rounded-[6px]"
              />
            </SettingsField>
            <SettingsField label="Company" htmlFor="company">
              <Input
                id="company"
                value={values.company}
                onChange={(e) => update("company", e.target.value)}
                className="rounded-[6px]"
              />
            </SettingsField>
            <SettingsField label="Job Title" htmlFor="jobTitle">
              <Input
                id="jobTitle"
                value={values.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
                className="rounded-[6px]"
              />
            </SettingsField>
            <SettingsField
              label="Timezone"
              tooltip="Used for scheduling campaigns and reports"
            >
              <Select
                value={values.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                options={TIMEZONES}
                className="rounded-[6px]"
              />
            </SettingsField>
            <SettingsField label="Language">
              <Select
                value={values.language}
                onChange={(e) => update("language", e.target.value)}
                options={LANGUAGES}
                className="rounded-[6px]"
              />
            </SettingsField>
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
