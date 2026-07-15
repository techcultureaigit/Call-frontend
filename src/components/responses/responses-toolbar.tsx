"use client";

import { Download, MessageSquareReply, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  RESPONSE_STATUS_OPTIONS,
  SENTIMENT_OPTIONS,
} from "@/lib/constants/responses";
import type { ResponseStatus } from "@/types/response";

export type ResponsesViewMode = "all" | "pending" | "flagged";

interface ResponsesToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: ResponseStatus | "all";
  onStatusChange: (v: ResponseStatus | "all") => void;
  campaignId: string;
  onCampaignChange: (v: string) => void;
  surveyId: string;
  onSurveyChange: (v: string) => void;
  sentiment: "positive" | "neutral" | "negative" | "all";
  onSentimentChange: (v: "positive" | "neutral" | "negative" | "all") => void;
  campaigns: { id: string; name: string }[];
  surveys: { id: string; name: string }[];
  onExport: () => void;
  isExporting?: boolean;
  viewMode: ResponsesViewMode;
  totalCount?: number;
}

const titles: Record<ResponsesViewMode, { title: string; description: string }> = {
  all: {
    title: "Survey Responses",
    description: "Review AI-extracted insights from survey and call responses.",
  },
  pending: {
    title: "Pending Review",
    description: "Responses awaiting manual review and approval.",
  },
  flagged: {
    title: "Flagged Responses",
    description: "Responses flagged by AI for attention or escalation.",
  },
};

export function ResponsesToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  campaignId,
  onCampaignChange,
  surveyId,
  onSurveyChange,
  sentiment,
  onSentimentChange,
  campaigns,
  surveys,
  onExport,
  isExporting,
  viewMode,
  totalCount,
}: ResponsesToolbarProps) {
  const { title, description } = titles[viewMode];
  const hasFilters =
    search.length > 0 ||
    status !== "all" ||
    campaignId !== "all" ||
    surveyId !== "all" ||
    sentiment !== "all";

  const clearAll = () => {
    onSearchChange("");
    onStatusChange("all");
    onCampaignChange("all");
    onSurveyChange("all");
    onSentimentChange("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareReply className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
            {totalCount !== undefined && (
              <span className="ml-1 font-medium text-foreground">
                ({totalCount} total)
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isExporting}
          className="shrink-0"
        >
          <Download className="size-4" />
          {isExporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-card">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customer, company, campaign, topics, or summary..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 border-border/60 bg-muted/30 pl-9"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {viewMode === "all" && (
            <Select
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value as ResponseStatus | "all")
              }
              options={[
                { label: "All Statuses", value: "all" },
                ...RESPONSE_STATUS_OPTIONS,
              ]}
            />
          )}
          <Select
            value={campaignId}
            onChange={(e) => onCampaignChange(e.target.value)}
            options={[
              { label: "All Campaigns", value: "all" },
              ...campaigns.map((c) => ({ label: c.name, value: c.id })),
            ]}
          />
          <Select
            value={surveyId}
            onChange={(e) => onSurveyChange(e.target.value)}
            options={[
              { label: "All Surveys", value: "all" },
              ...surveys.map((s) => ({ label: s.name, value: s.id })),
            ]}
          />
          <Select
            value={sentiment}
            onChange={(e) =>
              onSentimentChange(
                e.target.value as "positive" | "neutral" | "negative" | "all"
              )
            }
            options={[
              { label: "All Sentiments", value: "all" },
              ...SENTIMENT_OPTIONS.map((s) => ({
                label: s.label,
                value: s.value,
              })),
            ]}
          />
          {hasFilters && viewMode === "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-9 justify-start text-muted-foreground sm:col-span-2 lg:col-span-1"
            >
              <X className="size-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
