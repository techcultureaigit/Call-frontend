import type { ApiResponse } from "@/types/api";
import type {
  SurveyResultRow,
  SurveyResultsSurveyMeta,
} from "@/types/survey-result";
import { createQueryString } from "@/lib/utils";
import { getAccessTokenFromCookie } from "@/lib/auth/session";
import { apiEndpoints } from "./endpoints";
import { ApiError, apiDelete, apiGet, apiPost, apiUpload } from "./http";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BackendSurvey = Record<string, any>;

export interface SurveysListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface SurveyResultsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type SurveyResultsExportFormat = "xlsx" | "csv";

export interface SurveyResultsExportParams {
  format?: SurveyResultsExportFormat;
  search?: string;
}

interface PaginatedResponse {
  success: boolean;
  data: BackendSurvey[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SurveyResultsResponse {
  success: boolean;
  data:
    | SurveyResultRow[]
    | {
        results: SurveyResultRow[];
        survey: SurveyResultsSurveyMeta;
      };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function parseFilename(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim());
    } catch {
      return utfMatch[1].trim();
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(disposition);
  return plainMatch?.[1]?.trim() || fallback;
}

export const surveysApi = {
  list: (params?: SurveysListParams) =>
    apiGet<PaginatedResponse>(apiEndpoints.surveys.list, params),

  getById: (id: string) =>
    apiGet<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.detail(id)),

  /** POST /surveys — create (no id) or update (with id in body) */
  save: (payload: Record<string, unknown>) =>
    apiPost<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.list, payload),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(apiEndpoints.surveys.detail(id)),

  duplicate: (id: string) =>
    apiPost<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.duplicate(id)),

  schedule: (id: string, payload: Record<string, unknown>) =>
    apiPost<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.schedule(id), payload),

  listResults: (id: string, params?: SurveyResultsListParams) =>
    apiGet<SurveyResultsResponse>(apiEndpoints.surveys.results(id), params),

  /** Download survey results as Excel or CSV (blob). */
  exportResults: async (
    id: string,
    params: SurveyResultsExportParams = {}
  ): Promise<{ blob: Blob; filename: string }> => {
    const format = params.format ?? "xlsx";
    const query = createQueryString({
      format,
      search: params.search || undefined,
    });
    const headers = new Headers({ Accept: "*/*" });
    const token = getAccessTokenFromCookie();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(
      `${apiEndpoints.surveys.resultsExport(id)}${query}`,
      { headers, cache: "no-store" }
    );

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        message?: string;
        errors?: unknown;
      };
      throw new ApiError(
        error.message ?? "Failed to export survey results",
        response.status,
        error.errors ?? null
      );
    }

    const blob = await response.blob();
    const filename = parseFilename(
      response.headers.get("Content-Disposition"),
      `survey-results.${format}`
    );
    return { blob, filename };
  },

  uploadContactFile: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiUpload<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.contactFile(id), fd);
  },

  uploadQuestionsFile: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiUpload<ApiResponse<BackendSurvey>>(apiEndpoints.surveys.questionsFile(id), fd);
  },
};
