"use client";

import { motion } from "framer-motion";
import { Bot, Clock, LayoutTemplate, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber } from "@/lib/utils";
import type { TemplateStats } from "@/types/campaign-template";

export function TemplatesStatsBar({
  stats,
  isLoading,
}: {
  stats?: TemplateStats;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    {
      label: "Total Templates",
      value: stats.total,
      icon: LayoutTemplate,
      gradient: "from-violet-500/15 to-purple-500/5",
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-500/10",
    },
    {
      label: "Active Templates",
      value: stats.active,
      icon: Zap,
      gradient: "from-emerald-500/15 to-teal-500/5",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "AI Templates",
      value: stats.aiPowered,
      icon: Bot,
      gradient: "from-blue-500/15 to-sky-500/5",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10",
    },
    {
      label: "Recently Used",
      value: stats.recentlyUsed,
      icon: Clock,
      gradient: "from-amber-500/15 to-orange-500/5",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.35 }}
          className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${item.gradient} p-4 shadow-card backdrop-blur-sm transition-shadow hover:shadow-elevated`}
        >
          <div className="absolute -right-4 -top-4 size-24 rounded-full bg-white/5 blur-2xl transition-transform duration-500 group-hover:scale-125" />
          <div className="relative flex items-center gap-3">
            <div className={`rounded-xl p-2.5 ${item.iconBg}`}>
              <item.icon className={`size-4 ${item.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {formatCompactNumber(item.value)}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground">
                {item.label}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
