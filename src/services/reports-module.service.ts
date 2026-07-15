import type { ReportsData } from "@/types/reports";
import { createQueryString } from "@/lib/utils";

export interface ReportsParams {
  from?: string;
  to?: string;
  campaignId?: string;
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

export const reportsModuleService = {
  async getData(params: ReportsParams = {}) {
    const query = createQueryString(
      params as Record<string, string | undefined>
    );
    const res = await fetch(`/api/reports${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{ success: boolean; data: ReportsData }>(
      res
    );
    return json.data;
  },

  async getCampaigns() {
    const res = await fetch("/api/reports?campaigns=true", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: { id: string; name: string }[];
    }>(res);
    return json.data;
  },
};
