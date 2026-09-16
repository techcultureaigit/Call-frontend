import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";

/** v11 — reset local layout cache if reorder left sections unpaired (charts stacked). */
export const ANALYTICS_REPORT_LAYOUT_KEY = "analytics-report-layout-v11";
const LEGACY_LAYOUT_KEYS: string[] = [
  "analytics-report-layout-v10",
  "analytics-report-layout-v9",
  "analytics-report-layout-v8",
];

export const ANALYTICS_SECTION_IDS = [
  "kpis",
  "survey_status",
  "disconnect_reason",
  "question_analytics",
] as const;

export type AnalyticsSectionId = (typeof ANALYTICS_SECTION_IDS)[number];

export const ANALYTICS_SECTION_LABELS: Record<AnalyticsSectionId, string> = {
  kpis: "KPI cards",
  survey_status: "Survey status",
  disconnect_reason: "Disconnect reason",
  question_analytics: "Question analytics",
};

/** Grid column span: 2 = full width, 1 = half (left/right pair). */
export const ANALYTICS_SECTION_SPAN: Record<AnalyticsSectionId, 1 | 2> = {
  kpis: 2,
  survey_status: 1,
  disconnect_reason: 1,
  question_analytics: 2,
};

const PAIRABLE_SECTIONS = new Set<AnalyticsSectionId>([
  "survey_status",
  "disconnect_reason",
]);

/** Adjacent status + reason pies sit side by side. */
export function groupAnalyticsSections(
  order: AnalyticsSectionId[]
): AnalyticsSectionId[][] {
  const rows: AnalyticsSectionId[][] = [];
  let pair: AnalyticsSectionId[] = [];

  const flushPair = () => {
    if (!pair.length) return;
    rows.push(pair);
    pair = [];
  };

  for (const id of order) {
    if (PAIRABLE_SECTIONS.has(id)) {
      pair.push(id);
      if (pair.length === 2) flushPair();
      continue;
    }
    flushPair();
    rows.push([id]);
  }
  flushPair();
  return rows;
}

export const DEFAULT_KPI_ORDER: AnalyticsKpiFilterId[] = [
  "total_calls",
  "connected",
  "avg_duration",
];

export type AnalyticsReportLayout = {
  sections: AnalyticsSectionId[];
  kpis: AnalyticsKpiFilterId[];
};

export const DEFAULT_ANALYTICS_REPORT_LAYOUT: AnalyticsReportLayout = {
  sections: [...ANALYTICS_SECTION_IDS],
  kpis: [...DEFAULT_KPI_ORDER],
};

function isSectionId(value: string): value is AnalyticsSectionId {
  return ANALYTICS_SECTION_IDS.includes(value as AnalyticsSectionId);
}

function isKpiId(value: string): value is AnalyticsKpiFilterId {
  return DEFAULT_KPI_ORDER.includes(value as AnalyticsKpiFilterId);
}

function normalizeOrder<T extends string>(
  order: string[] | undefined,
  defaults: readonly T[],
  guard: (value: string) => value is T
): T[] {
  const seen = new Set<T>();
  const normalized: T[] = [];

  for (const id of order ?? []) {
    if (!guard(id) || seen.has(id)) continue;
    seen.add(id);
    normalized.push(id);
  }

  for (const id of defaults) {
    if (!seen.has(id)) normalized.push(id);
  }

  return normalized;
}

const REMOVED_SECTIONS = new Set([
  "overview",
  "charts",
  "completion_trend",
  "survey_breakdown",
  "call_outcomes",
  "call_performance",
]);

function migrateLegacySections(raw: string[] | undefined): string[] {
  if (!raw?.length) return [...ANALYTICS_SECTION_IDS];
  const filtered = raw.filter((id) => !REMOVED_SECTIONS.has(id));
  if (!filtered.includes("disconnect_reason")) {
    const idx = filtered.indexOf("survey_status");
    if (idx >= 0) filtered.splice(idx + 1, 0, "disconnect_reason");
    else filtered.push("disconnect_reason");
  }
  return filtered;
}

/** Keep survey status + disconnect side-by-side (live layout). */
function ensureAdjacentChartPair(
  sections: AnalyticsSectionId[]
): AnalyticsSectionId[] {
  const statusIdx = sections.indexOf("survey_status");
  const reasonIdx = sections.indexOf("disconnect_reason");
  if (statusIdx < 0 || reasonIdx < 0) return sections;
  if (Math.abs(statusIdx - reasonIdx) === 1) return sections;

  const rest = sections.filter(
    (id): id is AnalyticsSectionId =>
      id !== "survey_status" && id !== "disconnect_reason"
  );
  const kpiIdx = rest.indexOf("kpis");
  const insertAt = kpiIdx >= 0 ? kpiIdx + 1 : 0;
  const next: AnalyticsSectionId[] = [...rest];
  next.splice(insertAt, 0, "survey_status", "disconnect_reason");
  return next;
}

export function loadAnalyticsReportLayout(): AnalyticsReportLayout {
  if (typeof window === "undefined") return DEFAULT_ANALYTICS_REPORT_LAYOUT;

  try {
    const raw =
      window.localStorage.getItem(ANALYTICS_REPORT_LAYOUT_KEY) ??
      LEGACY_LAYOUT_KEYS.map((key) => window.localStorage.getItem(key)).find(
        Boolean
      ) ??
      null;
    if (!raw) return DEFAULT_ANALYTICS_REPORT_LAYOUT;

    const parsed = JSON.parse(raw) as Partial<AnalyticsReportLayout>;
    const layout: AnalyticsReportLayout = {
      sections: ensureAdjacentChartPair(
        normalizeOrder(
          migrateLegacySections(parsed.sections as string[] | undefined),
          ANALYTICS_SECTION_IDS,
          isSectionId
        )
      ),
      kpis: normalizeOrder(parsed.kpis, DEFAULT_KPI_ORDER, isKpiId),
    };

    window.localStorage.setItem(
      ANALYTICS_REPORT_LAYOUT_KEY,
      JSON.stringify(layout)
    );
    return layout;
  } catch {
    return DEFAULT_ANALYTICS_REPORT_LAYOUT;
  }
}

export function saveAnalyticsReportLayout(layout: AnalyticsReportLayout) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    ANALYTICS_REPORT_LAYOUT_KEY,
    JSON.stringify(layout)
  );
}
