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

  const emptyPie = [] as ReportsData["callOutcomeBreakdown"];

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
        id: "connected",
        label: "Connected",
        value: String(Math.round(totalCalls * 0.62)),
        change: 62,
        changeLabel: "% of calls",
        trend: "up",
      },
      {
        id: "disconnected",
        label: "Disconnected",
        value: String(Math.round(totalCalls * 0.18)),
        change: 18,
        changeLabel: "% of calls",
        trend: "down",
      },
      {
        id: "missed",
        label: "Missed",
        value: String(Math.round(totalCalls * 0.2)),
        change: 20,
        changeLabel: "% of calls",
        trend: "down",
      },
      {
        id: "survey_complete",
        label: "Survey Complete",
        value: `${Math.round(totalCalls * 0.45)}/${totalCalls}`,
        change: avgSuccess,
        changeLabel: `${avgSuccess.toFixed(1)}% complete`,
        trend: "up",
      },
      {
        id: "avg_duration",
        label: "Avg Duration",
        value: "4m 18s",
        change: -2.3,
        changeLabel: "vs prior period",
        trend: "down",
      },
    ],
    calls: {
      total: totalCalls,
      connected: Math.round(totalCalls * 0.62),
      disconnected: Math.round(totalCalls * 0.18),
      missed: Math.round(totalCalls * 0.2),
      connectRate: 62,
      pie: emptyPie,
    },
    survey: {
      complete: Math.round(totalCalls * 0.45),
      incomplete: Math.round(totalCalls * 0.25),
      missed: Math.round(totalCalls * 0.3),
      total: totalCalls,
      counting: `${Math.round(totalCalls * 0.45)}/${totalCalls}`,
      completionRate: Math.round(avgSuccess * 10) / 10,
      attempted: Math.round(totalCalls * 0.7),
      attemptedCounting: `${Math.round(totalCalls * 0.45)}/${Math.round(totalCalls * 0.7)}`,
      contactsTotal: 0,
      contactCoverage: null,
      pie: sentimentBreakdown,
    },
    duration: {
      averageSeconds: 258,
      medianSeconds: 240,
      averageLabel: "4m 18s",
      medianLabel: "4m 00s",
      sampleSize: totalCalls,
    },
    recording: {
      withRecording: Math.round(totalCalls * 0.7),
      withoutRecording: Math.round(totalCalls * 0.3),
      coverageRate: 70,
    },
    callsOverTime,
    successRateTrend,
    completionTrend: successRateTrend,
    responsesByCampaign:
      responsesByCampaign.length > 0
        ? responsesByCampaign
        : [{ label: campaign?.name ?? "Survey", value: 0, responses: 0 }],
    responsesBySurvey: SURVEY_OPTIONS.map((c) => ({
      surveyId: c.id,
      name: c.name,
      label: c.name,
      total: c.responses,
      value: c.responses,
      responses: c.responses,
      complete: Math.round(c.responses * 0.6),
      incomplete: Math.round(c.responses * 0.25),
      missed: Math.round(c.responses * 0.15),
      connected: Math.round(c.responses * 0.7),
      disconnected: Math.round(c.responses * 0.1),
      avgDurationSeconds: 240,
      completionRate: 60,
      counting: `${Math.round(c.responses * 0.6)}/${c.responses}`,
    })),
    campaignBreakdown,
    callOutcomeBreakdown: emptyPie,
    surveyStatusBreakdown: sentimentBreakdown,
    hangupBreakdown: emptyPie,
    sentimentBreakdown,
    questions: [],
    questionBars: [],
    dateRange: range,
    surveyId: campaignId,
    surveyName: campaign?.name,
    campaignId,
    campaignName: campaign?.name,
  };
}
