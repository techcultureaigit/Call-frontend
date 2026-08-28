import type { AnalyticsKpiFilterId } from "@/modules/reports/analytics-kpi-filter";
import { KPI_FILTER_LABELS } from "@/modules/reports/analytics-kpi-filter";

const VALID_METRICS = new Set<string>(Object.keys(KPI_FILTER_LABELS));

export function isAnalyticsMetric(value: string | null | undefined): value is AnalyticsKpiFilterId {
  return Boolean(value && VALID_METRICS.has(value));
}

export function parseAnalyticsMetric(
  value: string | null | undefined,
  fallback: AnalyticsKpiFilterId = "total_calls"
): AnalyticsKpiFilterId {
  return isAnalyticsMetric(value) ? value : fallback;
}

type AnalyticsQuery = {
  from?: string;
  to?: string;
  surveyId?: string;
  metric?: AnalyticsKpiFilterId;
  questionId?: string;
  page?: number;
};

function appendCommon(
  params: URLSearchParams,
  query: Pick<AnalyticsQuery, "from" | "to" | "surveyId">
) {
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.surveyId && query.surveyId !== "all") {
    params.set("surveyId", query.surveyId);
  }
}

/** KPI / donut click → full details page */
export function analyticsDetailsHref(query: AnalyticsQuery) {
  const params = new URLSearchParams();
  if (query.metric) params.set("metric", query.metric);
  appendCommon(params, query);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `/analytics/details?${qs}` : "/analytics/details";
}

/** Question analytics → full questions page */
export function analyticsQuestionsHref(query: AnalyticsQuery) {
  const params = new URLSearchParams();
  appendCommon(params, query);
  if (query.questionId) params.set("questionId", query.questionId);
  const qs = params.toString();
  return qs ? `/analytics/questions?${qs}` : "/analytics/questions";
}

/** Survey breakdown → full surveys page */
export function analyticsSurveysHref(query: Pick<AnalyticsQuery, "from" | "to" | "surveyId">) {
  const params = new URLSearchParams();
  appendCommon(params, query);
  const qs = params.toString();
  return qs ? `/analytics/surveys?${qs}` : "/analytics/surveys";
}

/** Back to main analytics with same filters */
export function analyticsHomeHref(query: Pick<AnalyticsQuery, "from" | "to" | "surveyId">) {
  const params = new URLSearchParams();
  appendCommon(params, query);
  const qs = params.toString();
  return qs ? `/analytics?${qs}` : "/analytics";
}
