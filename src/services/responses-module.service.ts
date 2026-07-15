import type { SurveyResponse } from "@/types/response";
import type { PaginatedResponse } from "@/types";
import { createQueryString } from "@/lib/utils";

export interface ResponsesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  campaignId?: string;
  surveyId?: string;
  sentiment?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ?? "Request failed"
    );
  }
  return res.json() as Promise<T>;
}

export const responsesModuleService = {
  async list(params: ResponsesListParams = {}) {
    const query = createQueryString(
      params as Record<string, string | number | boolean | undefined>
    );
    const res = await fetch(`/api/responses${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return handleResponse<PaginatedResponse<SurveyResponse>>(res);
  },

  async export(params: Omit<ResponsesListParams, "page" | "limit">) {
    const query = createQueryString({
      ...params,
      export: "true",
    } as Record<string, string | undefined>);
    const res = await fetch(`/api/responses${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: SurveyResponse[];
    }>(res);
    return json.data;
  },

  async getStats() {
    const res = await fetch("/api/responses?stats=true", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: {
        total: number;
        pending: number;
        flagged: number;
        completed: number;
        positive: number;
      };
    }>(res);
    return json.data;
  },

  async getFilterOptions() {
    const res = await fetch("/api/responses?filters=true", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: {
        campaigns: { id: string; name: string }[];
        surveys: { id: string; name: string }[];
      };
    }>(res);
    return json.data;
  },

  async getById(id: string) {
    const res = await fetch(`/api/responses/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: SurveyResponse;
    }>(res);
    return json.data;
  },
};
