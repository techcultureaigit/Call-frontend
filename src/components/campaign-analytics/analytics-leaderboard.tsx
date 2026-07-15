"use client";

import { motion } from "framer-motion";
import { Crown, Medal, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatPercent } from "@/lib/utils";
import type { TopPerformingCampaign } from "@/types/campaign-analytics";

const RANK_ICONS = [Trophy, Medal, Crown];

export function AnalyticsLeaderboard({
  campaigns,
  isLoading,
}: {
  campaigns: TopPerformingCampaign[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight">
          Top Performing Campaigns
        </h2>
        <p className="text-xs text-muted-foreground">
          Leaderboard by completion, response, and AI score
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {campaigns.map((campaign, i) => {
          const RankIcon = RANK_ICONS[i] ?? Crown;
          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br p-4 shadow-card backdrop-blur-sm transition-shadow hover:shadow-elevated",
                campaign.gradient
              )}
            >
              <div
                className="absolute -right-4 -top-4 size-20 rounded-full opacity-30 blur-2xl"
                style={{ backgroundColor: campaign.accent }}
              />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="flex size-8 items-center justify-center rounded-xl text-sm font-bold"
                    style={{
                      backgroundColor: `${campaign.accent}22`,
                      color: campaign.accent,
                    }}
                  >
                    #{campaign.rank}
                  </span>
                  <RankIcon
                    className="size-4"
                    style={{ color: campaign.accent }}
                  />
                </div>
                <p className="line-clamp-2 text-sm font-semibold leading-snug">
                  {campaign.name}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Metric label="Complete" value={formatPercent(campaign.completionPct)} />
                  <Metric label="Response" value={formatPercent(campaign.responsePct)} />
                  <Metric label="AI Score" value={campaign.aiScore.toFixed(1)} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/30 bg-background/40 px-1 py-1.5 backdrop-blur-sm">
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold tabular-nums">{value}</p>
    </div>
  );
}
