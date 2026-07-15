"use client";

import {
  LayoutGrid,
  List,
  Megaphone,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CAMPAIGN_STATUS_OPTIONS,
  CAMPAIGN_TYPE_OPTIONS,
} from "@/lib/constants/campaigns";
import { cn } from "@/lib/utils";
import type { CampaignStatus, CampaignType } from "@/types/campaign";

export type CampaignViewMode = "cards" | "table";

interface CampaignsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: CampaignStatus | "all";
  onStatusChange: (value: CampaignStatus | "all") => void;
  type: CampaignType | "all";
  onTypeChange: (value: CampaignType | "all") => void;
  viewMode: CampaignViewMode;
  onViewModeChange: (mode: CampaignViewMode) => void;
  onCreateClick: () => void;
  totalCount?: number;
}

export function CampaignsToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  viewMode,
  onViewModeChange,
  onCreateClick,
  totalCount,
}: CampaignsToolbarProps) {
  const hasFilters = status !== "all" || type !== "all" || search.length > 0;

  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("all");
    onTypeChange("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">Campaigns</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, manage, and monitor outbound campaigns.
            {totalCount !== undefined && (
              <span className="ml-1 font-medium text-foreground">
                ({totalCount} total)
              </span>
            )}
          </p>
        </div>
        <Button onClick={onCreateClick} className="shrink-0">
          <Plus className="size-4" />
          New Campaign
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-card lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 border-border/60 bg-muted/30 pl-9"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" />
            <Select
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value as CampaignStatus | "all")
              }
              options={[
                { label: "All Statuses", value: "all" },
                ...CAMPAIGN_STATUS_OPTIONS,
              ]}
              className="w-full sm:w-[150px]"
            />
            <Select
              value={type}
              onChange={(e) =>
                onTypeChange(e.target.value as CampaignType | "all")
              }
              options={[
                { label: "All Types", value: "all" },
                ...CAMPAIGN_TYPE_OPTIONS,
              ]}
              className="w-full sm:w-[160px]"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border/60 p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange("cards")}
              className={cn(
                "h-8 px-2.5",
                viewMode === "cards" && "bg-muted"
              )}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange("table")}
              className={cn(
                "h-8 px-2.5",
                viewMode === "table" && "bg-muted"
              )}
            >
              <List className="size-4" />
            </Button>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 text-muted-foreground"
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
