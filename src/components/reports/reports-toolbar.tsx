"use client";

import {
  Calendar,
  FileSpreadsheet,
  FileText,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const DATE_PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

interface ReportsToolbarProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onPreset: (days: number) => void;
  campaignId: string;
  onCampaignChange: (v: string) => void;
  campaigns: { id: string; name: string }[];
  onExportPdf: () => void;
  onExportExcel: () => void;
  isExporting?: boolean;
}

export function ReportsToolbar({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onPreset,
  campaignId,
  onCampaignChange,
  campaigns,
  onExportPdf,
  onExportExcel,
  isExporting,
}: ReportsToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Analytics
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Campaign performance, call metrics, and response insights.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPdf}
            disabled={isExporting}
            className="h-9"
          >
            <FileText className="size-4" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            disabled={isExporting}
            className="h-9"
          >
            <FileSpreadsheet className="size-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="rounded-[6px] border border-border/60 bg-card p-4 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Calendar className="size-3" />
                From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="h-9 w-full sm:w-[160px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="h-9 w-full sm:w-[160px]"
              />
            </div>
            <div className="flex gap-1.5">
              {DATE_PRESETS.map((p) => (
                <Button
                  key={p.days}
                  variant="outline"
                  size="sm"
                  onClick={() => onPreset(p.days)}
                  className="h-9 text-xs"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-2 lg:w-64">
            <div className="flex-1 space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Filter className="size-3" />
                Campaign
              </label>
              <Select
                value={campaignId}
                onChange={(e) => onCampaignChange(e.target.value)}
                options={[
                  { label: "All Campaigns", value: "all" },
                  ...campaigns.map((c) => ({
                    label: c.name,
                    value: c.id,
                  })),
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
