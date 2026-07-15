import type {
  CampaignAnalyticsData,
  CampaignAnalyticsQueryParams,
} from "@/types/campaign-analytics";
import { createQueryString } from "@/lib/utils";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ?? "Request failed"
    );
  }
  return res.json() as Promise<T>;
}

export const campaignAnalyticsService = {
  async getAnalytics(params: CampaignAnalyticsQueryParams = {}) {
    const query = createQueryString(
      params as Record<string, string | number | boolean | undefined>
    );
    const res = await fetch(`/api/campaigns/analytics${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{
      success: boolean;
      data: CampaignAnalyticsData;
    }>(res);
    return json.data;
  },
};
