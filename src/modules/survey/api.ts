/**
 * api.ts
 * Survey HTTP API — all backend calls live here.
 * Debug: [survey-api] in DevTools console.
 *
 * listSurveys          GET    /api/surveys
 * getSurvey            GET    /api/surveys/:id
 * saveSurvey           POST   /api/surveys
 * duplicateSurvey      POST   /api/surveys/:id/duplicate
 * scheduleSurvey       POST   /api/surveys/:id/schedule
 * unscheduleSurvey     POST   /api/surveys/:id/unschedule
 * deleteSurvey         DELETE /api/surveys/:id
 * bulkDeleteSurveys    DELETE /api/surveys/:id (multiple)
 * listSurveyResults    GET    /api/surveys/:id/results
 * getSurveyResult      GET    /api/surveys/:id/results/:resultId
 * getSurveyResultTranscriptions GET /api/surveys/:id/results/:resultId/transcriptions
 * exportSurveyResults  GET    /api/surveys/:id/results/export
 * uploadSurveyContactFile   POST /api/surveys/:id/contact-file
 * uploadSurveyQuestionsFile POST /api/surveys/:id/questions-file
 */
import type { ApiResponse } from "@/types/api";
import type { PaginatedMeta } from "@/types";
import type { Agent as Survey } from "@/types/agent";
import { createQueryString } from "@/lib/utils";
import { getAccessTokenFromCookie } from "@/lib/auth/session";
import { useApiLoadingStore } from "@/components/shared/api-loading.store";
import {
  createModuleApiCall,
  dedupeInflight,
  parseDownloadFilename,
  toPaginatedMeta,
} from "@/lib/api/module-helpers";
import {
  ApiError,
  apiDelete,
  apiGet,
  apiPost,
  apiUpload,
  resolveApiUrl,
} from "@/api/http";

import {
  agentToBackendPayload,
  backendSurveyToAgent,
  type BackendSurvey,
} from "./survey-mapper";
import type {
  SaveSurveyInput,
  ScheduleSurveyInput,
  SurveyResultRow,
  SurveyResultTranscription,
  SurveyResultsExportParams,
  SurveyResultsListParams,
  SurveyResultsListResult,
  SurveyResultsSurveyMeta,
  SurveysListParams,
  SurveysListResult,
} from "./survey-types";

/* ---------- HTTP helpers ---------- */
function toMeta(pagination?: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}): PaginatedMeta {
  return toPaginatedMeta(pagination, 10);
}

const surveyCall = createModuleApiCall("survey");

interface PaginatedResponse {
  success: boolean;
  data: BackendSurvey[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

interface SurveyResultsResponse {
  success: boolean;
  data:
    | SurveyResultRow[]
    | { results: SurveyResultRow[]; survey: SurveyResultsSurveyMeta };
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

/* ========== LIST — GET /api/surveys ========== */

/** listSurveys() → GET /api/surveys */
export async function listSurveys(
  params: SurveysListParams = {}
): Promise<SurveysListResult> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search || undefined,
    status: params.status,
    language: params.language || undefined,
    includeQuestions: params.includeQuestions ? true : undefined,
  };
  const qs = createQueryString(query as Record<string, string | number | boolean | undefined | null>);
  return surveyCall("listSurveys", "GET", "/api/surveys", async () => {
    return dedupeInflight(`GET /api/surveys${qs}`, async () => {
      const res = await apiGet<PaginatedResponse>("/api/surveys", query);
      return {
        data: (res.data ?? []).map(backendSurveyToAgent),
        meta: toMeta(res.pagination),
      };
    });
  }, query);
}

/* ========== READ / CREATE / UPDATE — GET|POST /api/surveys ========== */

/** getSurvey() → GET /api/surveys/:id */
export async function getSurvey(id: string): Promise<Survey> {
  const url = `/api/surveys/${id}`;
  return surveyCall("getSurvey", "GET", url, async () => {
    return dedupeInflight(`GET ${url}`, async () => {
      const res = await apiGet<ApiResponse<BackendSurvey>>(url);
      return backendSurveyToAgent(res.data);
    });
  }, { id });
}

/** saveSurvey() → POST /api/surveys */
export async function saveSurvey(
  input: SaveSurveyInput,
  schedule?: ScheduleSurveyInput | null,
  options?: { quiet?: boolean }
): Promise<Survey> {
  const payload = agentToBackendPayload(input, schedule);
  return surveyCall("saveSurvey", "POST", "/api/surveys", async () => {
    const res = await apiPost<ApiResponse<BackendSurvey>>(
      "/api/surveys",
      payload,
      { skipLoader: options?.quiet }
    );
    return backendSurveyToAgent(res.data);
  }, { id: input.id, step: input.step, schedule, quiet: options?.quiet });
}

/** duplicateSurvey() → POST /api/surveys/:id/duplicate */
export async function duplicateSurvey(id: string): Promise<Survey> {
  const url = `/api/surveys/${id}/duplicate`;
  return surveyCall("duplicateSurvey", "POST", url, async () => {
    const res = await apiPost<ApiResponse<BackendSurvey>>(url);
    return backendSurveyToAgent(res.data);
  }, { id });
}

/** scheduleSurvey() → POST /api/surveys/:id/schedule */
export async function scheduleSurvey(
  id: string,
  input: ScheduleSurveyInput
): Promise<Survey> {
  const url = `/api/surveys/${id}/schedule`;
  return surveyCall("scheduleSurvey", "POST", url, async () => {
    const res = await apiPost<ApiResponse<BackendSurvey>>(
      url,
      input as unknown as Record<string, unknown>
    );
    return backendSurveyToAgent(res.data);
  }, { id, input });
}

/** unscheduleSurvey() → POST /api/surveys/:id/unschedule */
export async function unscheduleSurvey(id: string): Promise<Survey> {
  const url = `/api/surveys/${id}/unschedule`;
  return surveyCall("unscheduleSurvey", "POST", url, async () => {
    const res = await apiPost<ApiResponse<BackendSurvey>>(url);
    return backendSurveyToAgent(res.data);
  }, { id });
}

/* ========== DELETE — DELETE /api/surveys/:id ========== */

/** deleteSurvey() → DELETE /api/surveys/:id */
export async function deleteSurvey(id: string): Promise<void> {
  const url = `/api/surveys/${id}`;
  return surveyCall("deleteSurvey", "DELETE", url, async () => {
    await apiDelete<ApiResponse<null>>(url);
  }, { id });
}

/** bulkDeleteSurveys() → DELETE /api/surveys/:id (called once per id) */
export async function bulkDeleteSurveys(
  ids: string[]
): Promise<{ deleted: number; failed: number }> {
  return surveyCall("bulkDeleteSurveys", "DELETE", "/api/surveys/:id×N", async () => {
    const results = await Promise.allSettled(
      ids.map(async (id) => {
        await apiDelete<ApiResponse<null>>(`/api/surveys/${id}`);
      })
    );
    const deleted = results.filter((r) => r.status === "fulfilled").length;
    return { deleted, failed: results.length - deleted };
  }, { ids });
}

/* ========== RESULTS — GET /api/surveys/:id/results ========== */

/** listSurveyResults() → GET /api/surveys/:id/results */
export async function listSurveyResults(
  id: string,
  params: SurveyResultsListParams = {}
): Promise<SurveyResultsListResult> {
  const url = `/api/surveys/${id}/results`;
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    search: params.search || undefined,
    status: params.status || undefined,
    sortBy: params.sortBy || undefined,
    sortOrder: params.sortOrder || undefined,
  };
  return surveyCall("listSurveyResults", "GET", url, async () => {
    const res = await apiGet<SurveyResultsResponse>(url, query);
    const payload = res.data;
    const results = Array.isArray(payload) ? payload : (payload?.results ?? []);
    const survey = Array.isArray(payload) ? null : (payload?.survey ?? null);
    return { data: results, survey, meta: toMeta(res.pagination) };
  }, { id, ...query });
}

/** getSurveyResult() → GET /api/surveys/:id/results/:resultId */
export async function getSurveyResult(surveyId: string, resultId: string) {
  const url = `/api/surveys/${surveyId}/results/${resultId}`;
  return surveyCall("getSurveyResult", "GET", url, async () => {
    const res = await apiGet<
      ApiResponse<{ result: SurveyResultRow; survey: SurveyResultsSurveyMeta }>
    >(url);
    return { result: res.data.result, survey: res.data.survey ?? null };
  }, { surveyId, resultId });
}

/** getSurveyResultTranscriptions() → GET /api/surveys/:id/results/:resultId/transcriptions */
export async function getSurveyResultTranscriptions(
  surveyId: string,
  resultId: string
) {
  const url = `/api/surveys/${surveyId}/results/${resultId}/transcriptions`;
  return surveyCall("getSurveyResultTranscriptions", "GET", url, async () => {
    const res = await apiGet<
      ApiResponse<{
        id: string;
        customer_number: string;
        transcriptions: SurveyResultTranscription[];
      }>
    >(url);
    return res.data;
  }, { surveyId, resultId });
}

/* ========== EXPORT — GET /api/surveys/:id/results/export ========== */

/** exportSurveyResults() → GET /api/surveys/:id/results/export */
export async function exportSurveyResults(
  id: string,
  params: SurveyResultsExportParams = {}
) {
  const format = params.format ?? "xlsx";
  const query = createQueryString({
    format,
    search: params.search || undefined,
    status: params.status || undefined,
  });
  const url = `/api/surveys/${id}/results/export${query}`;
  return surveyCall("exportSurveyResults", "GET", url, async () => {
    const headers = new Headers({ Accept: "*/*" });
    const token = getAccessTokenFromCookie();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    useApiLoadingStore
      .getState()
      .start({ label: "Exporting", hint: "Preparing your file" });
    try {
      const response = await fetch(resolveApiUrl(url), {
        headers,
        cache: "no-store",
        credentials: "include",
      });
      if (!response.ok) {
        let error: { message?: string; errors?: unknown } = {};
        try {
          error = await response.json();
        } catch {
          // ignore JSON parse errors
        }
        throw new ApiError(
          error.message ?? "Failed to export survey results",
          response.status,
          error.errors ?? null
        );
      }
      const blob = await response.blob();
      return {
        blob,
        filename: parseDownloadFilename(
          response.headers.get("Content-Disposition"),
          `survey-results.${format}`
        ),
      };
    } finally {
      useApiLoadingStore.getState().stop();
    }
  }, { id, format, search: params.search });
}

/* ========== UPLOAD — POST /api/surveys/:id/*-file ========== */

/** uploadSurveyContactFile() → POST /api/surveys/:id/contact-file */
export async function uploadSurveyContactFile(
  surveyId: string,
  file: File
): Promise<Survey> {
  const url = `/api/surveys/${surveyId}/contact-file`;
  return surveyCall("uploadSurveyContactFile", "POST", url, async () => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiUpload<ApiResponse<BackendSurvey>>(url, fd);
    return backendSurveyToAgent(res.data);
  }, { surveyId, fileName: file.name, size: file.size });
}

/** uploadSurveyQuestionsFile() → POST /api/surveys/:id/questions-file */
export async function uploadSurveyQuestionsFile(
  surveyId: string,
  file: File
): Promise<Survey> {
  const url = `/api/surveys/${surveyId}/questions-file`;
  return surveyCall("uploadSurveyQuestionsFile", "POST", url, async () => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiUpload<ApiResponse<BackendSurvey>>(url, fd);
    return backendSurveyToAgent(res.data);
  }, { surveyId, fileName: file.name, size: file.size });
}

/* ---------- namespace ---------- */
export const surveysApi = {
  list: listSurveys,
  getById: getSurvey,
  save: saveSurvey,
  delete: deleteSurvey,
  bulkDelete: bulkDeleteSurveys,
  duplicate: duplicateSurvey,
  schedule: scheduleSurvey,
  unschedule: unscheduleSurvey,
  listResults: listSurveyResults,
  getResult: getSurveyResult,
  getResultTranscriptions: getSurveyResultTranscriptions,
  exportResults: exportSurveyResults,
  uploadContactFile: uploadSurveyContactFile,
  uploadQuestionsFile: uploadSurveyQuestionsFile,
};
