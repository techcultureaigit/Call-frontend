"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks";
import { MOCK_SETTINGS } from "@/lib/data/mock-settings";
import {
  getSettingsNavItem,
  SETTINGS_NAV,
} from "@/lib/constants/settings-navigation";
import { cn } from "@/lib/utils";
import { SettingsBreadcrumbs } from "./settings-breadcrumbs";
import { SettingsSearch } from "./settings-search";
import { SettingsNav } from "./settings-nav";
import { SettingsSaveBar } from "./settings-save-bar";
import { SettingsAutosaveIndicator } from "./settings-status-badge";
import { ProfileSection } from "./sections/profile-section";
import { SecuritySection } from "./sections/security-section";
import { NotificationsSection } from "./sections/notifications-section";
import { AppearanceSection } from "./sections/appearance-section";
import { SmtpSection } from "./sections/smtp-section";
import { ApiKeysSection } from "./sections/api-keys-section";
import { VoiceSection } from "./sections/voice-section";
import { AiSection } from "./sections/ai-section";
import { IntegrationsSection } from "./sections/integrations-section";
import { SystemSection } from "./sections/system-section";
import { AuditSection } from "./sections/audit-section";
import { DangerSection } from "./sections/danger-section";
import type { AppSettings, SettingsSectionId } from "@/types/settings";

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function SettingsView() {
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>("profile");
  const [savedSettings, setSavedSettings] = useState<AppSettings>(
    deepClone(MOCK_SETTINGS)
  );
  const [settings, setSettings] = useState<AppSettings>(
    deepClone(MOCK_SETTINGS)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "unsaved"
  >("idle");

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isDirty) setSaveStatus("unsaved");
    else if (saveStatus === "unsaved") setSaveStatus("idle");
  }, [isDirty, saveStatus]);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Settings",
    breadcrumbs: [
      { label: "System", href: "/settings" },
      { label: getSettingsNavItem(activeSection)?.label ?? "Settings" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, activeSection]);

  const updateSection = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!settings.profile.fullName.trim()) {
      toast.error("Full name is required");
      setActiveSection("profile");
      return;
    }
    if (!settings.profile.email.includes("@")) {
      toast.error("Valid email is required");
      setActiveSection("profile");
      return;
    }

    setIsSaving(true);
    setSaveStatus("saving");
    await new Promise((r) => setTimeout(r, 800));
    setSavedSettings(deepClone(settings));
    setIsSaving(false);
    setSaveStatus("saved");
    toast.success("Settings saved successfully");
    setTimeout(() => setSaveStatus("idle"), 3000);
  }, [settings]);

  const handleDiscard = useCallback(() => {
    setSettings(deepClone(savedSettings));
    setSaveStatus("idle");
    toast.info("Changes discarded");
  }, [savedSettings]);

  const navItem = getSettingsNavItem(activeSection);

  const renderSection = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 rounded-[6px]" />
          <Skeleton className="h-64 rounded-[6px]" />
          <Skeleton className="h-48 rounded-[6px]" />
        </div>
      );
    }

    switch (activeSection) {
      case "profile":
        return (
          <ProfileSection
            values={settings.profile}
            onChange={(v) => updateSection("profile", v)}
          />
        );
      case "security":
        return (
          <SecuritySection
            values={settings.security}
            onChange={(v) => updateSection("security", v)}
          />
        );
      case "notifications":
        return (
          <NotificationsSection
            values={settings.notifications}
            onChange={(v) => updateSection("notifications", v)}
          />
        );
      case "appearance":
        return (
          <AppearanceSection
            values={settings.appearance}
            onChange={(v) => updateSection("appearance", v)}
          />
        );
      case "smtp":
        return (
          <SmtpSection
            values={settings.smtp}
            onChange={(v) => updateSection("smtp", v)}
          />
        );
      case "api-keys":
        return (
          <ApiKeysSection
            values={settings.apiKeys}
            onChange={(v) => updateSection("apiKeys", v)}
          />
        );
      case "voice-providers":
        return (
          <VoiceSection
            values={settings.voice}
            onChange={(v) => updateSection("voice", v)}
          />
        );
      case "ai-configuration":
        return (
          <AiSection
            values={settings.ai}
            onChange={(v) => updateSection("ai", v)}
          />
        );
      case "integrations":
        return (
          <IntegrationsSection
            values={settings.integrations}
            onChange={(v) => updateSection("integrations", v)}
          />
        );
      case "system":
        return (
          <SystemSection
            values={settings.system}
            onChange={(v) => updateSection("system", v)}
          />
        );
      case "audit":
        return <AuditSection values={settings.audit} />;
      case "danger-zone":
        return <DangerSection />;
      default:
        return null;
    }
  };

  return (
    <>
      <PageContainer size="wide">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 pb-24"
        >
          <div className="space-y-4">
            <SettingsBreadcrumbs activeSection={activeSection} />
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-1">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account, security, integrations, and system
                  configuration.
                </p>
              </div>
              <SettingsAutosaveIndicator
                status={isSaving ? "saving" : saveStatus}
              />
            </div>
            <SettingsSearch onSelect={setActiveSection} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {SETTINGS_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  activeSection === item.id
                    ? item.danger
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-primary/30 bg-primary/10 text-primary"
                    : "border-border/60 bg-card text-muted-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className="sticky top-4">
                <SettingsNav
                  active={activeSection}
                  onChange={setActiveSection}
                />
              </div>
            </aside>

            <main className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {navItem && (
                    <div className="mb-2">
                      <h2 className="text-lg font-semibold tracking-tight">
                        {navItem.label}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {navItem.description}
                      </p>
                    </div>
                  )}
                  {renderSection()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </motion.div>
      </PageContainer>

      <SettingsSaveBar
        visible={isDirty}
        status={isSaving ? "saving" : "unsaved"}
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
      />
    </>
  );
}
