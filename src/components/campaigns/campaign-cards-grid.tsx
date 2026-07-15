"use client";

import { motion } from "framer-motion";
import { Calendar, Megaphone, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { CAMPAIGN_TYPE_OPTIONS } from "@/lib/constants/campaigns";
import {
  cn,
  formatCompactNumber,
  formatDate,
  formatPercent,
} from "@/lib/utils";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { CampaignActions } from "./campaign-actions";
import type { Campaign } from "@/types/campaign";

function getTypeLabel(type: Campaign["type"]) {
  return CAMPAIGN_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

interface CampaignCardsGridProps {
  campaigns: Campaign[];
  isLoading?: boolean;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
  onRetry: (id: string) => void;
  onLaunch: (id: string) => void;
  isActionLoading?: boolean;
}

export function CampaignCardsGrid({
  campaigns,
  isLoading,
  onPause,
  onResume,
  onStop,
  onRetry,
  onLaunch,
  isActionLoading,
}: CampaignCardsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Megaphone}
          title="No campaigns found"
          description="Create a new campaign or adjust your filters."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign, i) => {
        const progress =
          campaign.stats.totalCalls > 0
            ? Math.round(
                (campaign.stats.completedCalls / campaign.stats.totalCalls) * 100
              )
            : 0;

        return (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-elevated">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">
                      {campaign.name}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getTypeLabel(campaign.type)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <CampaignStatusBadge
                      status={campaign.status}
                      pulse={campaign.status === "active"}
                    />
                    <CampaignActions
                      campaign={campaign}
                      onPause={onPause}
                      onResume={onResume}
                      onStop={onStop}
                      onRetry={onRetry}
                      onLaunch={onLaunch}
                      isLoading={isActionLoading}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-4 pt-0">
                {campaign.description && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {campaign.description}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="text-center">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCompactNumber(campaign.stats.totalCalls)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Calls</p>
                  </div>
                  <div className="border-x border-border/40 text-center">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatPercent(campaign.stats.successRate)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Success</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCompactNumber(campaign.stats.responses)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Responses
                    </p>
                  </div>
                </div>

                {campaign.stats.totalCalls > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          campaign.status === "active"
                            ? "bg-emerald-500"
                            : "bg-primary"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {campaign.customerCount} customers
                  </span>
                  {campaign.schedule?.startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatDate(campaign.schedule.startDate)}
                    </span>
                  )}
                </div>

                <CampaignActions
                  campaign={campaign}
                  variant="buttons"
                  onPause={onPause}
                  onResume={onResume}
                  onStop={onStop}
                  onRetry={onRetry}
                  onLaunch={onLaunch}
                  isLoading={isActionLoading}
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
