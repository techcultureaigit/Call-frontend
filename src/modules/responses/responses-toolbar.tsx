"use client";

import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ListToolbar } from "@/components/shared/list-toolbar";
import {
  RESPONSE_STATUS_OPTIONS,
  SENTIMENT_OPTIONS,
} from "@/modules/responses/responses-constants";
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

const titles: Record<
  ResponsesViewMode,
  { title: string; description: string }
> = {
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

const filterSelectClass =
  "h-11 w-full rounded-[6px] border-border/50 bg-background/80 shadow-subtle sm:w-44";

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
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {description}
            {totalCount !== undefined && (
              <span className="ml-1 font-medium text-foreground">
                ({totalCount} total)
              </span>
            )}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          className="h-11 shrink-0 rounded-[6px] gap-1.5 border-border/50 bg-background/80 shadow-subtle hover:border-primary/30"
        >
          <Download className="size-4" />
          {isExporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search customer, company, campaign, topics, or summary..."
        searchAriaLabel="Search responses"
        filters={
          <>
            {viewMode === "all" ? (
              <Select
                value={status}
                onChange={(e) =>
                  onStatusChange(e.target.value as ResponseStatus | "all")
                }
                options={[
                  { label: "All statuses", value: "all" },
                  ...RESPONSE_STATUS_OPTIONS,
                ]}
                className={filterSelectClass}
                aria-label="Filter by status"
              />
            ) : null}
            <Select
              value={campaignId}
              onChange={(e) => onCampaignChange(e.target.value)}
              options={[
                { label: "All campaigns", value: "all" },
                ...campaigns.map((c) => ({ label: c.name, value: c.id })),
              ]}
              className={filterSelectClass}
              aria-label="Filter by campaign"
            />
            <Select
              value={surveyId}
              onChange={(e) => onSurveyChange(e.target.value)}
              options={[
                { label: "All surveys", value: "all" },
                ...surveys.map((s) => ({ label: s.name, value: s.id })),
              ]}
              className={filterSelectClass}
              aria-label="Filter by survey"
            />
            <Select
              value={sentiment}
              onChange={(e) =>
                onSentimentChange(
                  e.target.value as "positive" | "neutral" | "negative" | "all"
                )
              }
              options={[
                { label: "All sentiments", value: "all" },
                ...SENTIMENT_OPTIONS.map((s) => ({
                  label: s.label,
                  value: s.value,
                })),
              ]}
              className={filterSelectClass}
              aria-label="Filter by sentiment"
            />
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-11 shrink-0 text-muted-foreground"
              >
                <X className="size-3.5" />
                Clear
              </Button>
            ) : null}
          </>
        }
      />
    </div>
  );
}
