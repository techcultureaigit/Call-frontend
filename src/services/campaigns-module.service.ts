import type { CreateCampaignPayload, Campaign } from "@/types/campaign";
import type { PaginatedResponse } from "@/types";
import type { CampaignStats } from "@/types/campaign";
import { createQueryString } from "@/lib/utils";

export interface CampaignsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  live?: boolean;
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

export const campaignsModuleService = {
  async list(params: CampaignsListParams = {}) {
    const query = createQueryString(
      params as Record<string, string | number | boolean | undefined>
    );
    const response = await fetch(`/api/campaigns${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return handleResponse<PaginatedResponse<Campaign>>(response);
  },

  async getAggregateStats() {
    const response = await fetch("/api/campaigns?aggregate=true", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: CampaignStats & { activeCount: number };
    }>(response);
    return json.data;
  },

  async getById(id: string, live = false) {
    const query = live ? "?live=true" : "";
    const response = await fetch(`/api/campaigns/${id}${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{ success: boolean; data: Campaign }>(
      response
    );
    return json.data;
  },

  async getStats(id: string) {
    const response = await fetch(`/api/campaigns/${id}?stats=true&live=true`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{ success: boolean; data: CampaignStats }>(
      response
    );
    return json.data;
  },

  async create(payload: CreateCampaignPayload) {
    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await handleResponse<{ success: boolean; data: Campaign }>(
      response
    );
    return json.data;
  },

  async action(id: string, action: "pause" | "resume" | "stop" | "launch" | "retry_failed") {
    const response = await fetch("/api/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const json = await handleResponse<{ success: boolean; data: Campaign }>(
      response
    );
    return json.data;
  },

  async delete(id: string) {
    const response = await fetch(`/api/campaigns/${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ success: boolean }>(response);
  },
};
