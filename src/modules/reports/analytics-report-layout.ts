import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";

/** Bumped to v2 — charts split into independent cards for free grid reorder. */
export const ANALYTICS_REPORT_LAYOUT_KEY = "analytics-report-layout-v2";
const LEGACY_LAYOUT_KEY = "analytics-report-layout-v1";

export const ANALYTICS_SECTION_IDS = [
  "kpis",
  "survey_status",
  "completion_trend",
  "survey_breakdown",
  "question_analytics",
] as const;

export type AnalyticsSectionId = (typeof ANALYTICS_SECTION_IDS)[number];

export const ANALYTICS_SECTION_LABELS: Record<AnalyticsSectionId, string> = {
  kpis: "KPI cards",
  survey_status: "Survey status",
  completion_trend: "Completion trend",
  survey_breakdown: "By survey",
  question_analytics: "Question analytics",
};

/** Grid column span: 2 = full width, 1 = half (left/right pair). */
export const ANALYTICS_SECTION_SPAN: Record<AnalyticsSectionId, 1 | 2> = {
  kpis: 2,
  survey_status: 1,
  completion_trend: 1,
  survey_breakdown: 2,
  question_analytics: 2,
};

export const DEFAULT_KPI_ORDER: AnalyticsKpiFilterId[] = [
  "total_calls",
  "connected",
  "missed",
  "survey_complete",
  "survey_partial",
  "survey_incomplete",
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

/** Migrate v1 `charts` → `survey_status` + `completion_trend`. */
function migrateLegacySections(raw: string[] | undefined): string[] {
  if (!raw?.length) return [...ANALYTICS_SECTION_IDS];
  const next: string[] = [];
  for (const id of raw) {
    if (id === "charts") {
      next.push("survey_status", "completion_trend");
      continue;
    }
    next.push(id);
  }
  return next;
}

export function loadAnalyticsReportLayout(): AnalyticsReportLayout {
  if (typeof window === "undefined") return DEFAULT_ANALYTICS_REPORT_LAYOUT;

  try {
    const raw =
      window.localStorage.getItem(ANALYTICS_REPORT_LAYOUT_KEY) ??
      window.localStorage.getItem(LEGACY_LAYOUT_KEY);
    if (!raw) return DEFAULT_ANALYTICS_REPORT_LAYOUT;

    const parsed = JSON.parse(raw) as Partial<AnalyticsReportLayout>;
    const layout: AnalyticsReportLayout = {
      sections: normalizeOrder(
        migrateLegacySections(parsed.sections as string[] | undefined),
        ANALYTICS_SECTION_IDS,
        isSectionId
      ),
      kpis: normalizeOrder(parsed.kpis, DEFAULT_KPI_ORDER, isKpiId),
    };

    // Persist migrated layout under v2 key
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
