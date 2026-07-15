"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LogOut, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatRelativeTime } from "@/lib/utils";
import { SettingsSectionCard } from "../settings-section-card";
import { SettingsField } from "../settings-field";
import { SettingsToggleRow } from "../settings-toggle-row";
import type { SecuritySettings } from "@/types/settings";

interface SecuritySectionProps {
  values: SecuritySettings;
  onChange: (values: SecuritySettings) => void;
}

export function SecuritySection({ values, onChange }: SecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const terminateAll = () => {
    onChange({
      ...values,
      sessions: values.sessions.filter((s) => s.current),
    });
    toast.success("All other sessions terminated");
  };

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="Change Password"
        description="Update your account password"
        helpTooltip="Use a strong password with at least 12 characters, mixed case, and symbols."
        gradient="from-blue-500/10 to-transparent"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Current Password">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-xl"
            />
          </SettingsField>
          <div className="hidden sm:block" />
          <SettingsField label="New Password">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-xl"
            />
          </SettingsField>
          <SettingsField label="Confirm Password">
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl"
            />
          </SettingsField>
        </div>
        <Button onClick={handlePasswordChange} className="rounded-xl">
          Update Password
        </Button>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Two-Factor Authentication"
        description="Add an extra layer of security"
        helpTooltip="Require a verification code from your authenticator app when signing in."
        gradient="from-emerald-500/10 to-transparent"
      >
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
          <div>
            <Label className="text-sm font-medium">
              Enable Two-Factor Authentication
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Protect your account with TOTP-based 2FA
            </p>
          </div>
          <Switch
            checked={values.twoFactorEnabled}
            onCheckedChange={(checked) =>
              onChange({ ...values, twoFactorEnabled: checked })
            }
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Active Sessions"
        description="Devices currently signed in"
        helpTooltip="Review and revoke access from devices you don't recognize."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={terminateAll}
            className="rounded-xl text-destructive hover:text-destructive"
          >
            <LogOut className="size-3.5" />
            Terminate All
          </Button>
        }
      >
        <div className="space-y-2">
          {values.sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-xl border border-border/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {session.device.includes("iPhone") ? (
                  <Smartphone className="size-4 text-muted-foreground" />
                ) : (
                  <Monitor className="size-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {session.device}
                    {session.current && (
                      <span className="ml-2 text-[10px] font-semibold text-emerald-600">
                        CURRENT
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.location} · {session.ip} ·{" "}
                    {formatRelativeTime(session.lastActive)}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() =>
                    onChange({
                      ...values,
                      sessions: values.sessions.filter(
                        (s) => s.id !== session.id
                      ),
                    })
                  }
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Login History"
        description="Recent sign-in attempts"
        helpTooltip="Monitor successful and failed login attempts across locations."
      >
        <div className="space-y-2">
          {values.loginHistory.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 text-sm"
            >
              <div>
                <span
                  className={
                    entry.status === "success"
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                >
                  {entry.status === "success" ? "Success" : "Failed"}
                </span>
                <span className="mx-2 text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {entry.location} ({entry.ip})
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(entry.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="Trusted Devices" description="Devices you've marked as trusted">
        <div className="flex flex-wrap gap-2">
          {values.trustedDevices.map((device) => (
            <div
              key={device.id}
              className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-sm"
            >
              <p className="font-medium">{device.name}</p>
              <p className="text-[11px] text-muted-foreground">
                Last used {formatRelativeTime(device.lastUsed)}
              </p>
            </div>
          ))}
        </div>
      </SettingsSectionCard>
    </div>
  );
}
