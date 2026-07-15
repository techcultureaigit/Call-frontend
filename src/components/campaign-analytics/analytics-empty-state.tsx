"use client";

import { motion } from "framer-motion";
import { BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AnalyticsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl border border-dashed border-border/70 bg-gradient-to-br from-muted/30 via-background to-violet-500/5 px-6 py-20 text-center"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1),transparent_60%)]" />
      <div className="relative mx-auto max-w-md space-y-6">
        <div className="relative mx-auto size-24">
          <div className="absolute inset-0 animate-pulse rounded-3xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 blur-xl" />
          <div className="relative flex size-full items-center justify-center rounded-3xl border border-border/50 bg-card/80 shadow-elevated backdrop-blur-md">
            <BarChart3 className="size-10 text-violet-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight">
            No analytics data yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Launch your first campaign to unlock performance insights, AI
            analytics, and real-time monitoring.
          </p>
        </div>
        <Button asChild className="rounded-xl px-6">
          <Link href="/campaigns/new">
            <Plus className="size-4" />
            Create Campaign
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
