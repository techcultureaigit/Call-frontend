"use client";

import { toast } from "sonner";
import { Plug, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { SettingsSectionCard } from "../settings-section-card";
import { SettingsStatusBadge } from "../settings-status-badge";
import type { IntegrationEntry } from "@/types/settings";

interface IntegrationsSectionProps {
  values: IntegrationEntry[];
  onChange: (values: IntegrationEntry[]) => void;
}

export function IntegrationsSection({
  values,
  onChange,
}: IntegrationsSectionProps) {
  const toggle = (id: string) => {
    onChange(
      values.map((i) =>
        i.id === id
          ? {
              ...i,
              connected: !i.connected,
              lastSync: !i.connected
                ? new Date().toISOString()
                : undefined,
            }
          : i
      )
    );
    const item = values.find((i) => i.id === id);
    toast.success(
      item?.connected
        ? `${item.name} disconnected`
        : `${item?.name} connected`
    );
  };

  return (
    <SettingsSectionCard
      title="Integrations"
      description="Connect external tools and services"
      helpTooltip="Enable integrations to sync data, send alerts, and automate workflows."
      gradient="from-emerald-500/10 to-transparent"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {values.map((integration) => (
          <div
            key={integration.id}
            className="flex flex-col justify-between rounded-[6px] border border-border/50 bg-muted/20 p-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{integration.name}</p>
                <SettingsStatusBadge
                  connected={integration.connected}
                  label={integration.connected ? "Connected" : "Disconnected"}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {integration.description}
              </p>
              {integration.lastSync && (
                <p className="text-[10px] text-muted-foreground">
                  Last sync {formatRelativeTime(integration.lastSync)}
                </p>
              )}
            </div>
            <Button
              variant={integration.connected ? "outline" : "default"}
              size="sm"
              onClick={() => toggle(integration.id)}
              className="mt-4 w-full rounded-[6px]"
            >
              {integration.connected ? (
                <>
                  <Plug className="size-3.5" />
                  Disconnect
                </>
              ) : (
                <>
                  <PlugZap className="size-3.5" />
                  Connect
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </SettingsSectionCard>
  );
}
