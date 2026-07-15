"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatRelativeTime } from "@/lib/utils";
import { AnalyticsCard } from "./analytics-card";
import type { AnalyticsActivity, AnalyticsActivityType } from "@/types/campaign-analytics";

const ACTIVITY_CONFIG: Record<
  AnalyticsActivityType,
  { icon: React.ElementType; color: string; label: string }
> = {
  started: { icon: Play, color: "text-emerald-600 bg-emerald-500/10", label: "Campaign Started" },
  completed: { icon: CheckCircle2, color: "text-blue-600 bg-blue-500/10", label: "Campaign Completed" },
  paused: { icon: Pause, color: "text-amber-600 bg-amber-500/10", label: "Campaign Paused" },
  failed: { icon: AlertTriangle, color: "text-red-600 bg-red-500/10", label: "Campaign Failed" },
  retry: { icon: RefreshCw, color: "text-violet-600 bg-violet-500/10", label: "Retry Triggered" },
};

export function AnalyticsActivities({
  activities,
  isLoading,
}: {
  activities: AnalyticsActivity[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-80 rounded-2xl" />;
  }

  return (
    <AnalyticsCard
      title="Recent Activities"
      description="Campaign lifecycle events timeline"
      gradient="from-slate-500/8 to-transparent"
    >
      <div className="relative space-y-0">
        <div className="absolute bottom-2 left-[15px] top-2 w-px bg-border/60" />
        {activities.map((activity, i) => {
          const config = ACTIVITY_CONFIG[activity.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative flex gap-3 pb-4 last:pb-0"
            >
              <div
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card",
                  config.color.split(" ")[1]
                )}
              >
                <Icon className={cn("size-3.5", config.color.split(" ")[0])} />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-xs font-medium">{config.label}</p>
                <p className="mt-0.5 truncate text-sm">{activity.campaignName}</p>
                {activity.detail && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {activity.detail}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AnalyticsCard>
  );
}
