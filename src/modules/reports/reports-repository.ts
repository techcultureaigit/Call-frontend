import type { ReportsData, ReportsQueryParams } from "@/types/reports";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const SURVEY_OPTIONS = [
  { id: "surv-1", name: "Enterprise NPS Survey", responses: 1240 },
  { id: "surv-2", name: "Product Feedback Loop", responses: 980 },
  { id: "surv-3", name: "Customer Renewal Follow-up", responses: 412 },
  { id: "surv-4", name: "Support Satisfaction", responses: 578 },
  { id: "surv-5", name: "Onboarding Check-in", responses: 298 },
  { id: "surv-6", name: "Churn Prevention", responses: 356 },
];

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

function scaleValue(base: number, surveyId: string): number {
  if (surveyId === "all") return base;
  const idx = SURVEY_OPTIONS.findIndex((c) => c.id === surveyId);
  if (idx === -1) return base;
  return Math.round(base * (0.6 + (idx % 5) * 0.08));
}

export function getReportCampaigns() {
  return SURVEY_OPTIONS.map((c) => ({ id: c.id, name: c.name }));
}

export function generateReportsData(
  params: ReportsQueryParams = {}
): ReportsData {
  const range = {
    from: params.from ?? defaultDateRange().from,
    to: params.to ?? defaultDateRange().to,
  };
  const campaignId = params.campaignId ?? "all";
  const campaign = SURVEY_OPTIONS.find((c) => c.id === campaignId);

  const days = 7;
  const callsOverTime: ReportsData["callsOverTime"] = Array.from(
    { length: days },
    (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const base = 120 + i * 15 + (campaignId !== "all" ? -20 : 0);
      return {
        label,
        value: scaleValue(base + Math.floor(Math.sin(i) * 30), campaignId),
        calls: scaleValue(base + Math.floor(Math.sin(i) * 30), campaignId),
      };
    }
  );

  const successRateTrend = Array.from({ length: days }, (_, i) => ({
    label: callsOverTime[i].label,
    value: 68 + i * 2 + (campaignId !== "all" ? 3 : 0),
    success: 68 + i * 2 + (campaignId !== "all" ? 3 : 0),
    failed: 32 - i * 2,
  }));

  const responsesByCampaign = SURVEY_OPTIONS.slice(0, 6)
    .map((c) => ({
      label: c.name.length > 18 ? c.name.slice(0, 16) + "…" : c.name,
      value:
        campaignId === "all" || campaignId === c.id ? c.responses : 0,
      responses:
        campaignId === "all" || campaignId === c.id ? c.responses : 0,
    }))
    .filter((r) => r.value > 0 || campaignId === "all");

  const campaignBreakdown: ReportsData["campaignBreakdown"] = [
    { name: "Outbound Sales", value: 35, fill: CHART_COLORS[0] },
    { name: "Customer Surveys", value: 28, fill: CHART_COLORS[1] },
    { name: "Follow-ups", value: 22, fill: CHART_COLORS[2] },
    { name: "Support", value: 15, fill: CHART_COLORS[3] },
  ];

  if (campaignId !== "all" && campaign) {
    campaignBreakdown[0] = {
      name: campaign.name,
      value: 72,
      fill: CHART_COLORS[0],
    };
    campaignBreakdown[1] = { name: "Other", value: 28, fill: CHART_COLORS[1] };
    campaignBreakdown.length = 2;
  }

  const sentimentBreakdown: ReportsData["sentimentBreakdown"] = [
    { name: "Positive", value: 58, fill: "var(--chart-2)" },
    { name: "Neutral", value: 27, fill: "var(--chart-3)" },
    { name: "Negative", value: 15, fill: "var(--chart-4)" },
  ];

  const totalCalls = callsOverTime.reduce((s, d) => s + (d.calls as number), 0);
  const avgSuccess =
    successRateTrend.reduce((s, d) => s + (d.success as number), 0) / days;

  return {
    kpis: [
      {
        id: "total-calls",
        label: "Total Calls",
        value: totalCalls.toLocaleString(),
        change: campaignId === "all" ? 12.4 : 8.2,
        changeLabel: "vs prior period",
        trend: "up",
      },
      {
        id: "success-rate",
        label: "Success Rate",
        value: `${avgSuccess.toFixed(1)}%`,
        change: 3.1,
        changeLabel: "vs prior period",
        trend: "up",
      },
      {
        id: "responses",
        label: "Survey Responses",
        value: scaleValue(1956, campaignId).toLocaleString(),
        change: 15.7,
        changeLabel: "vs prior period",
        trend: "up",
      },
      {
        id: "avg-duration",
        label: "Avg Duration",
        value: "4m 18s",
        change: -2.3,
        changeLabel: "vs prior period",
        trend: "down",
      },
      {
        id: "conversion",
        label: "Conversion Rate",
        value: `${(avgSuccess * 0.65).toFixed(1)}%`,
        change: 1.8,
        changeLabel: "vs prior period",
        trend: "up",
      },
      {
        id: "nps",
        label: "Avg NPS Score",
        value: "7.4",
        change: 0.6,
        changeLabel: "vs prior period",
        trend: "up",
      },
    ],
    callsOverTime,
    successRateTrend,
    responsesByCampaign:
      responsesByCampaign.length > 0
        ? responsesByCampaign
        : [{ label: campaign?.name ?? "Survey", value: 0, responses: 0 }],
    campaignBreakdown,
    sentimentBreakdown,
    dateRange: range,
    campaignId,
    campaignName: campaign?.name,
  };
}
