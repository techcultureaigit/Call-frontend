"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SettingsSectionCard } from "../settings-section-card";
import type { AppearanceSettings, AccentColor, ThemeMode } from "@/types/settings";

const ACCENT_COLORS: { value: AccentColor; label: string; class: string }[] = [
  { value: "violet", label: "Violet", class: "bg-violet-500" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "emerald", label: "Emerald", class: "bg-emerald-500" },
  { value: "rose", label: "Rose", class: "bg-rose-500" },
  { value: "amber", label: "Amber", class: "bg-amber-500" },
];

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

interface AppearanceSectionProps {
  values: AppearanceSettings;
  onChange: (values: AppearanceSettings) => void;
}

export function AppearanceSection({
  values,
  onChange,
}: AppearanceSectionProps) {
  const update = <K extends keyof AppearanceSettings>(
    key: K,
    val: AppearanceSettings[K]
  ) => onChange({ ...values, [key]: val });

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="Theme"
        description="Choose your preferred color scheme"
        helpTooltip="System theme automatically matches your OS dark/light preference."
        gradient="from-indigo-500/10 to-transparent"
      >
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = values.theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("theme", opt.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-all",
                  selected
                    ? "border-primary/40 bg-primary/10 shadow-subtle"
                    : "border-border/40 bg-muted/20 hover:bg-muted/40"
                )}
              >
                <Icon
                  className={cn(
                    "size-5",
                    selected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Accent Color"
        description="Primary brand color for the interface"
        helpTooltip="Accent color applies to buttons, links, and active navigation states."
      >
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => update("accentColor", color.value)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 transition-all",
                values.accentColor === color.value
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/40 hover:bg-muted/30"
              )}
            >
              <span
                className={cn("size-4 rounded-full", color.class)}
              />
              <span className="text-xs font-medium">{color.label}</span>
            </button>
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="Layout" description="Sidebar and density preferences">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Sidebar Style</Label>
            <Select
              value={values.sidebarStyle}
              onChange={(e) =>
                update(
                  "sidebarStyle",
                  e.target.value as AppearanceSettings["sidebarStyle"]
                )
              }
              options={[
                { label: "Default", value: "default" },
                { label: "Compact", value: "compact" },
                { label: "Floating", value: "floating" },
              ]}
              className="rounded-xl"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
            <div>
              <Label className="text-sm font-medium">Compact Mode</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Reduce spacing for data-dense views
              </p>
            </div>
            <Switch
              checked={values.compactMode}
              onCheckedChange={(c) => update("compactMode", c)}
            />
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
