import type { Call } from "@/types/call";
import type { PaginatedResponse } from "@/types";
import { createQueryString } from "@/lib/utils";

export interface CallsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  hasRecording?: boolean;
  liveOnly?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ?? "Request failed"
    );
  }
  return response.json() as Promise<T>;
}

export const callsModuleService = {
  async list(params: CallsListParams = {}) {
    const query = createQueryString(
      params as Record<string, string | number | boolean | undefined>
    );
    const response = await fetch(`/api/calls${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return handleResponse<PaginatedResponse<Call>>(response);
  },

  async getStats() {
    const response = await fetch("/api/calls?stats=true", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: {
        live: number;
        completed: number;
        failed: number;
        withRecording: number;
        total: number;
      };
    }>(response);
    return json.data;
  },

  async getById(id: string) {
    const response = await fetch(`/api/calls/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{ success: boolean; data: Call }>(
      response
    );
    return json.data;
  },

  async retry(id: string) {
    const response = await fetch("/api/calls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "retry", id }),
    });
    const json = await handleResponse<{ success: boolean; data: Call }>(
      response
    );
    return json.data;
  },
};
