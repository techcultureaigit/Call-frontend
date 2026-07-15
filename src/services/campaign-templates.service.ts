import type { CampaignTemplate, CreateTemplatePayload } from "@/types/campaign-template";
import { createQueryString } from "@/lib/utils";

export interface TemplatesListParams {
  search?: string;
  category?: string;
  status?: string;
  language?: string;
  aiOnly?: boolean;
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

export const campaignTemplatesService = {
  async list(params: TemplatesListParams = {}) {
    const query = createQueryString(
      params as Record<string, string | number | boolean | undefined>
    );
    const res = await fetch(`/api/campaigns/templates${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: CampaignTemplate[];
    }>(res);
    return json.data;
  },

  async getStats() {
    const res = await fetch("/api/campaigns/templates?stats=true", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: {
        total: number;
        active: number;
        aiPowered: number;
        recentlyUsed: number;
        byCategory: Record<string, number>;
      };
    }>(res);
    return json.data;
  },

  async getById(id: string) {
    const res = await fetch(`/api/campaigns/templates?id=${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: CampaignTemplate;
    }>(res);
    return json.data;
  },

  async create(payload: CreateTemplatePayload) {
    const res = await fetch("/api/campaigns/templates", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await handleResponse<{
      success: boolean;
      data: CampaignTemplate;
    }>(res);
    return json.data;
  },

  async duplicate(id: string) {
    const res = await fetch("/api/campaigns/templates", {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "duplicate", id }),
    });
    const json = await handleResponse<{
      success: boolean;
      data: CampaignTemplate;
    }>(res);
    return json.data;
  },

  async archive(id: string) {
    const res = await fetch("/api/campaigns/templates", {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "archive", id }),
    });
    const json = await handleResponse<{
      success: boolean;
      data: CampaignTemplate;
    }>(res);
    return json.data;
  },

  async update(id: string, payload: CreateTemplatePayload) {
    const res = await fetch("/api/campaigns/templates", {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "update", id, payload }),
    });
    const json = await handleResponse<{
      success: boolean;
      data: CampaignTemplate;
    }>(res);
    return json.data;
  },

  async delete(id: string) {
    const res = await fetch(`/api/campaigns/templates?id=${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    return handleResponse<{ success: boolean }>(res);
  },
};
