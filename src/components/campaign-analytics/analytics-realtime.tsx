"use client";

import { motion } from "framer-motion";
import { Activity, Gauge, Phone, Radio, Users, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { AnalyticsCard } from "./analytics-card";
import type { RealtimeMetrics } from "@/types/campaign-analytics";

export function AnalyticsRealtime({
  data,
  isLoading,
}: {
  data?: RealtimeMetrics;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-72 rounded-2xl" />;
  }

  if (!data) return null;

  const metrics = [
    { label: "Live Campaigns", value: data.liveCampaigns, icon: Radio, color: "text-emerald-600" },
    { label: "Live Calls", value: data.liveCalls, icon: Phone, color: "text-blue-600" },
    { label: "Queue Size", value: data.queueSize, icon: Activity, color: "text-amber-600" },
    { label: "Workers Online", value: data.workersOnline, icon: Users, color: "text-violet-600" },
    { label: "Processing Speed", value: `${data.processingSpeed}/min`, icon: Gauge, color: "text-cyan-600" },
  ];

  return (
    <AnalyticsCard
      title="Real-Time Operations"
      description="Live campaign status and call queue"
      gradient="from-emerald-500/10 via-teal-500/5 to-transparent"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs font-medium text-emerald-600">Live</span>
        <span className="text-[10px] text-muted-foreground">
          Updates every 30s
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-border/40 bg-muted/20 p-3 text-center"
          >
            <m.icon className={cn("mx-auto size-4", m.color)} />
            <p className="mt-1.5 text-lg font-semibold tabular-nums">
              {m.value}
            </p>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Active Campaigns
        </p>
        {data.campaigns.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <Zap className="size-3.5 text-amber-500" />
              <span className="text-sm font-medium">{c.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs tabular-nums text-muted-foreground">
                {c.calls} in queue
              </span>
              <CampaignStatusBadge status={c.status} />
            </div>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}
