"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  GitCompare,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DATE_PRESETS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

interface AnalyticsHeaderProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onPreset: (days: number) => void;
  campaignId: string;
  onCampaignChange: (v: string) => void;
  campaigns: { id: string; name: string }[];
  compareEnabled: boolean;
  onCompareToggle: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function AnalyticsHeader({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onPreset,
  campaignId,
  onCampaignChange,
  campaigns,
  compareEnabled,
  onCompareToggle,
  onExportPdf,
  onExportExcel,
  onRefresh,
  isRefreshing,
}: AnalyticsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Campaign Analytics
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Real-time performance insights, AI conversation analytics, and
            campaign comparison across your enterprise outreach.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCompareToggle}
            className={cn(
              "rounded-xl",
              compareEnabled && "border-primary/40 bg-primary/10 text-primary"
            )}
          >
            <GitCompare className="size-3.5" />
            Compare Period
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPdf}
            className="rounded-xl"
          >
            <FileText className="size-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            className="rounded-xl"
          >
            <FileSpreadsheet className="size-3.5" />
            <span className="hidden sm:inline">Export Excel</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-xl"
          >
            <RefreshCw
              className={cn("size-3.5", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/50 p-4 shadow-card backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Campaign
            </label>
            <Select
              value={campaignId}
              onChange={(e) => onCampaignChange(e.target.value)}
              options={[
                { label: "All Campaigns", value: "all" },
                ...campaigns.map((c) => ({ label: c.name, value: c.id })),
              ]}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Calendar className="size-3" />
                From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="h-10 w-full rounded-xl sm:w-[150px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="h-10 w-full rounded-xl sm:w-[150px]"
              />
            </div>
            <div className="flex gap-1.5">
              {DATE_PRESETS.map((p) => (
                <Button
                  key={p.days}
                  variant="outline"
                  size="sm"
                  onClick={() => onPreset(p.days)}
                  className="h-10 rounded-xl text-xs"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
