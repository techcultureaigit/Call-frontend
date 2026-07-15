import { MOCK_CAMPAIGNS } from "@/lib/data/mock-campaigns";
import { CAMPAIGN_STATUS_OPTIONS } from "@/lib/constants/campaigns";
import type {
  CampaignAnalyticsData,
  CampaignAnalyticsQueryParams,
  CampaignPerformanceRow,
} from "@/types/campaign-analytics";
import type { PaginatedMeta } from "@/types/common";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const KPI_GRADIENTS = [
  "from-violet-500/15 via-purple-500/8 to-fuchsia-500/5",
  "from-blue-500/15 via-sky-500/8 to-cyan-500/5",
  "from-emerald-500/15 via-teal-500/8 to-green-500/5",
  "from-amber-500/15 via-orange-500/8 to-yellow-500/5",
  "from-rose-500/15 via-pink-500/8 to-red-500/5",
  "from-indigo-500/15 via-blue-500/8 to-violet-500/5",
  "from-cyan-500/15 via-sky-500/8 to-blue-500/5",
  "from-fuchsia-500/15 via-purple-500/8 to-violet-500/5",
  "from-lime-500/15 via-green-500/8 to-emerald-500/5",
  "from-slate-500/15 via-zinc-500/8 to-stone-500/5",
];

const LEADERBOARD_GRADIENTS = [
  { gradient: "from-amber-500/25 via-yellow-500/15 to-orange-500/8", accent: "#f59e0b" },
  { gradient: "from-slate-400/25 via-zinc-400/15 to-stone-400/8", accent: "#94a3b8" },
  { gradient: "from-orange-600/25 via-amber-600/15 to-yellow-600/8", accent: "#ea580c" },
  { gradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/5", accent: "#8b5cf6" },
  { gradient: "from-blue-500/20 via-sky-500/10 to-cyan-500/5", accent: "#3b82f6" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "hi", label: "Hindi" },
  { value: "de", label: "German" },
];

const TAGS = ["Enterprise", "NPS", "Q2", "Outbound", "Priority", "AI", "Retention"];

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

function scale(base: number, factor: number): number {
  return Math.round(base * factor);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function filterCampaigns(params: CampaignAnalyticsQueryParams) {
  let list = [...MOCK_CAMPAIGNS];

  if (params.campaignId && params.campaignId !== "all") {
    list = list.filter((c) => c.id === params.campaignId);
  }
  if (params.status && params.status !== "all") {
    list = list.filter((c) => c.status === params.status);
  }
  if (params.surveyId && params.surveyId !== "all") {
    list = list.filter((c) => c.surveyId === params.surveyId);
  }
  if (params.createdBy && params.createdBy !== "all") {
    list = list.filter((c) => c.createdBy === params.createdBy);
  }
  if (params.search?.trim()) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.createdByName.toLowerCase().includes(q)
    );
  }

  return list;
}

function toPerformanceRows(campaigns: typeof MOCK_CAMPAIGNS): CampaignPerformanceRow[] {
  return campaigns.map((c, i) => ({
    id: c.id,
    name: c.name,
    createdBy: c.createdBy,
    createdByName: c.createdByName,
    customers: c.customerCount,
    calls: c.stats.totalCalls,
    completed: c.stats.completedCalls,
    failed: c.stats.failedCalls,
    responseRate:
      c.stats.totalCalls > 0
        ? Math.round((c.stats.responses / c.stats.totalCalls) * 100)
        : 0,
    successRate: c.stats.successRate,
    avgDurationSeconds: c.stats.avgDurationSeconds,
    status: c.status,
    tags: [TAGS[i % TAGS.length], TAGS[(i + 2) % TAGS.length]],
    language: LANGUAGES[i % LANGUAGES.length].value,
    surveyName: c.surveyName ?? "—",
  }));
}

function paginate<T>(
  items: T[],
  page: number,
  limit: number
): { data: T[]; meta: PaginatedMeta } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

function sortRows(
  rows: CampaignPerformanceRow[],
  sortBy?: string,
  sortOrder: "asc" | "desc" = "desc"
): CampaignPerformanceRow[] {
  if (!sortBy) return rows;
  const sorted = [...rows].sort((a, b) => {
    const key = sortBy as keyof CampaignPerformanceRow;
    const av = a[key];
    const bv = b[key];
    if (typeof av === "number" && typeof bv === "number") return av - bv;
    return String(av).localeCompare(String(bv));
  });
  return sortOrder === "desc" ? sorted.reverse() : sorted;
}

export function generateCampaignAnalytics(
  params: CampaignAnalyticsQueryParams = {}
): CampaignAnalyticsData {
  const range = {
    from: params.from ?? defaultDateRange().from,
    to: params.to ?? defaultDateRange().to,
  };
  const compareEnabled = params.comparePeriod ?? false;
  const campaigns = filterCampaigns(params);
  const factor =
    params.campaignId && params.campaignId !== "all" ? 0.35 : 1;

  const totalCampaigns = campaigns.length;
  const running = campaigns.filter((c) => c.status === "active").length;
  const completed = campaigns.filter((c) => c.status === "completed").length;
  const paused = campaigns.filter((c) => c.status === "paused").length;
  const failedCalls = campaigns.reduce((s, c) => s + c.stats.failedCalls, 0);
  const totalCalls = campaigns.reduce((s, c) => s + c.stats.totalCalls, 0);
  const completedCalls = campaigns.reduce(
    (s, c) => s + c.stats.completedCalls,
    0
  );
  const totalResponses = campaigns.reduce((s, c) => s + c.stats.responses, 0);
  const totalCustomers = campaigns.reduce((s, c) => s + c.customerCount, 0);
  const avgSuccess =
    campaigns.length > 0
      ? Math.round(
          campaigns.reduce((s, c) => s + c.stats.successRate, 0) /
            campaigns.length
        )
      : 0;
  const avgDuration =
    campaigns.length > 0
      ? Math.round(
          campaigns.reduce((s, c) => s + c.stats.avgDurationSeconds, 0) /
            campaigns.length
        )
      : 0;
  const avgResponseRate =
    totalCalls > 0 ? Math.round((totalResponses / totalCalls) * 100) : 0;

  const compareMult = compareEnabled ? 1.12 : 1;

  const kpis: CampaignAnalyticsData["kpis"] = [
    {
      id: "total-campaigns",
      label: "Total Campaigns",
      value: String(totalCampaigns),
      change: compareEnabled ? 8.2 : 0,
      changeLabel: "vs prior period",
      trend: "up",
      gradient: KPI_GRADIENTS[0],
      icon: "layers",
    },
    {
      id: "running",
      label: "Running Campaigns",
      value: String(running),
      change: compareEnabled ? 12.5 : 0,
      changeLabel: "vs prior period",
      trend: "up",
      gradient: KPI_GRADIENTS[1],
      icon: "zap",
    },
    {
      id: "completed",
      label: "Completed Campaigns",
      value: String(completed),
      change: compareEnabled ? 6.1 : 0,
      changeLabel: "vs prior period",
      trend: "up",
      gradient: KPI_GRADIENTS[2],
      icon: "check",
    },
    {
      id: "paused",
      label: "Paused Campaigns",
      value: String(paused),
      change: compareEnabled ? -4.2 : 0,
      changeLabel: "vs prior period",
      trend: compareEnabled ? "down" : "neutral",
      gradient: KPI_GRADIENTS[3],
      icon: "pause",
    },
    {
      id: "failed-calls",
      label: "Failed Calls",
      value: scale(failedCalls, factor).toLocaleString(),
      change: compareEnabled ? -9.8 : 0,
      changeLabel: "vs prior period",
      trend: compareEnabled ? "down" : "neutral",
      gradient: KPI_GRADIENTS[4],
      icon: "x",
    },
    {
      id: "success-rate",
      label: "Success Rate",
      value: `${avgSuccess}%`,
      change: compareEnabled ? 3.4 * compareMult : 0,
      changeLabel: "vs prior period",
      trend: "up",
      gradient: KPI_GRADIENTS[5],
      icon: "trending",
    },
    {
      id: "avg-duration",
      label: "Avg Call Duration",
      value: formatDuration(avgDuration),
      change: compareEnabled ? -2.1 : 0,
      changeLabel: "vs prior period",
      trend: compareEnabled ? "down" : "neutral",
      gradient: KPI_GRADIENTS[6],
      icon: "clock",
    },
    {
      id: "response-rate",
      label: "Avg Response Rate",
      value: `${avgResponseRate}%`,
      change: compareEnabled ? 5.7 : 0,
      changeLabel: "vs prior period",
      trend: "up",
      gradient: KPI_GRADIENTS[7],
      icon: "message",
    },
    {
      id: "customers",
      label: "Customers Contacted",
      value: scale(totalCustomers * 42, factor).toLocaleString(),
      change: compareEnabled ? 14.2 : 0,
      changeLabel: "vs prior period",
      trend: "up",
      gradient: KPI_GRADIENTS[8],
      icon: "users",
    },
    {
      id: "ai-score",
      label: "AI Satisfaction Score",
      value: "4.6/5",
      change: compareEnabled ? 2.8 : 0,
      changeLabel: "vs prior period",
      trend: "up",
      gradient: KPI_GRADIENTS[9],
      icon: "sparkles",
    },
  ];

  const days = 14;
  const performanceLine = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const base = scale(85 + i * 4 + Math.sin(i * 0.8) * 20, factor);
    const prior = scale(78 + i * 3 + Math.sin(i * 0.7) * 18, factor);
    return {
      label,
      value: base,
      current: base,
      ...(compareEnabled ? { prior } : {}),
    };
  });

  const dailyCalls = Array.from({ length: days }, (_, i) => {
    const label = performanceLine[i].label;
    const calls = scale(140 + i * 8 + Math.cos(i) * 25, factor);
    return { label, value: calls, calls };
  });

  const callStatusPie = [
    {
      name: "Completed",
      value: completedCalls,
      fill: CHART_COLORS[1],
    },
    {
      name: "Failed",
      value: failedCalls,
      fill: CHART_COLORS[3],
    },
    {
      name: "Pending",
      value: Math.max(
        0,
        totalCalls - completedCalls - failedCalls
      ),
      fill: CHART_COLORS[2],
    },
  ].filter((s) => s.value > 0);

  const successRateArea = Array.from({ length: days }, (_, i) => ({
    label: performanceLine[i].label,
    value: avgSuccess - 5 + i * 0.4 + Math.sin(i) * 2,
    success: avgSuccess - 5 + i * 0.4 + Math.sin(i) * 2,
  }));

  const campaignComparison = campaigns.slice(0, 6).map((c) => ({
    label: c.name.length > 16 ? c.name.slice(0, 14) + "…" : c.name,
    value: c.stats.successRate,
    success: c.stats.successRate,
    responses: Math.round((c.stats.responses / c.stats.totalCalls) * 100),
  }));

  const responseRateTrend = Array.from({ length: days }, (_, i) => ({
    label: performanceLine[i].label,
    value: avgResponseRate - 8 + i * 0.5,
    rate: avgResponseRate - 8 + i * 0.5,
  }));

  const languageDistribution = LANGUAGES.map((l, i) => ({
    name: l.label,
    value: [38, 22, 15, 14, 11][i] ?? 10,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const engagementHeatmap = daysOfWeek.flatMap((day, di) =>
    Array.from({ length: 12 }, (_, hi) => ({
      day,
      hour: hi + 8,
      value: Math.round(
        (30 + Math.sin(di + hi * 0.5) * 20 + (hi > 3 && hi < 8 ? 25 : 0)) *
          factor
      ),
    }))
  );

  const aiAnalytics: CampaignAnalyticsData["aiAnalytics"] = {
    conversationScore: 87,
    avgConfidence: 92.4,
    avgResponseTimeMs: 1240,
    avgSurveyCompletion: 78,
    sentiment: { positive: 58, neutral: 27, negative: 15 },
    topIntents: [
      { intent: "Product Inquiry", count: 1842, pct: 32 },
      { intent: "Support Request", count: 1204, pct: 21 },
      { intent: "Billing Question", count: 986, pct: 17 },
      { intent: "Feedback", count: 842, pct: 15 },
      { intent: "Cancellation Risk", count: 512, pct: 9 },
    ],
    topQuestions: [
      { question: "How satisfied are you with our service?", count: 2840 },
      { question: "Would you recommend us to a colleague?", count: 2210 },
      { question: "What could we improve?", count: 1890 },
      { question: "How likely are you to renew?", count: 1540 },
      { question: "Which feature do you use most?", count: 1120 },
    ],
    responseAccuracy: 94.2,
  };

  let performanceRows = toPerformanceRows(campaigns);
  if (params.language && params.language !== "all") {
    performanceRows = performanceRows.filter(
      (r) => r.language === params.language
    );
  }
  if (params.tag && params.tag !== "all") {
    performanceRows = performanceRows.filter((r) =>
      r.tags.includes(params.tag!)
    );
  }
  performanceRows = sortRows(
    performanceRows,
    params.sortBy,
    params.sortOrder ?? "desc"
  );
  const { data: tableData, meta: tableMeta } = paginate(
    performanceRows,
    params.page ?? 1,
    params.limit ?? 8
  );

  const topPerforming = [...campaigns]
    .sort((a, b) => b.stats.successRate - a.stats.successRate)
    .slice(0, 5)
    .map((c, i) => ({
      id: c.id,
      name: c.name,
      rank: i + 1,
      completionPct: Math.round(
        (c.stats.completedCalls / c.stats.totalCalls) * 100
      ),
      responsePct: Math.round(
        (c.stats.responses / c.stats.totalCalls) * 100
      ),
      aiScore: 4.2 + (5 - i) * 0.12,
      gradient: LEADERBOARD_GRADIENTS[i]?.gradient ?? LEADERBOARD_GRADIENTS[3].gradient,
      accent: LEADERBOARD_GRADIENTS[i]?.accent ?? "#8b5cf6",
    }));

  const activityTypes = [
    "started",
    "completed",
    "paused",
    "failed",
    "retry",
  ] as const;
  const recentActivities = campaigns.slice(0, 8).map((c, i) => {
    const type = activityTypes[i % activityTypes.length];
    const hours = i * 2 + 1;
    return {
      id: `act_${c.id}_${i}`,
      type,
      campaignId: c.id,
      campaignName: c.name,
      timestamp: new Date(Date.now() - hours * 3600000).toISOString(),
      detail:
        type === "retry"
          ? "Auto-retry triggered for 12 failed calls"
          : type === "failed"
            ? "3 consecutive call failures detected"
            : undefined,
    };
  });

  const activeCampaigns = MOCK_CAMPAIGNS.filter((c) => c.status === "active");
  const realtime: CampaignAnalyticsData["realtime"] = {
    liveCampaigns: activeCampaigns.length,
    liveCalls: scale(47, factor),
    queueSize: scale(128, factor),
    workersOnline: 24,
    processingSpeed: scale(18, factor),
    campaigns: activeCampaigns.slice(0, 4).map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      calls: c.stats.pendingCalls,
    })),
  };

  const surveys = [
    ...new Map(
      MOCK_CAMPAIGNS.filter((c) => c.surveyId).map((c) => [
        c.surveyId!,
        { id: c.surveyId!, name: c.surveyName ?? c.surveyId! },
      ])
    ).values(),
  ];

  const creators = [
    ...new Map(
      MOCK_CAMPAIGNS.map((c) => [
        c.createdBy,
        { id: c.createdBy, name: c.createdByName },
      ])
    ).values(),
  ];

  return {
    kpis,
    performanceLine,
    dailyCalls,
    callStatusPie,
    successRateArea,
    campaignComparison,
    responseRateTrend,
    languageDistribution,
    engagementHeatmap,
    aiAnalytics,
    performanceTable: tableData,
    tableMeta,
    topPerforming,
    recentActivities,
    realtime,
    filterOptions: {
      campaigns: MOCK_CAMPAIGNS.map((c) => ({ id: c.id, name: c.name })),
      surveys,
      creators,
      languages: LANGUAGES,
      tags: TAGS,
      statuses: CAMPAIGN_STATUS_OPTIONS.map((o) => ({
        value: o.value,
        label: o.label,
      })),
    },
    dateRange: range,
    compareEnabled,
    isEmpty: campaigns.length === 0,
  };
}
