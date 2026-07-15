import { MOCK_CAMPAIGNS, generateCampaignId } from "@/lib/data/mock-campaigns";
import type { PaginatedMeta, PaginatedResponse } from "@/types";
import type {
  Campaign,
  CampaignStats,
  CampaignStatus,
  CampaignType,
  CreateCampaignPayload,
} from "@/types/campaign";

let campaignsDB: Campaign[] = [...MOCK_CAMPAIGNS];

export interface CampaignsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CampaignStatus | "all";
  type?: CampaignType | "all";
  sortBy?: keyof Campaign | "name";
  sortOrder?: "asc" | "desc";
  live?: boolean;
}

function simulateLiveStats(stats: CampaignStats): CampaignStats {
  const delta = Math.floor(Math.random() * 4) + 1;
  const newCompleted = stats.completedCalls + delta;
  const newTotal = stats.totalCalls + delta;
  const newPending = Math.max(0, stats.pendingCalls - delta);
  const newResponses = stats.responses + Math.floor(Math.random() * 2);
  const successRate =
    newTotal > 0
      ? Math.round((newCompleted / (newCompleted + stats.failedCalls)) * 100)
      : stats.successRate;

  return {
    ...stats,
    totalCalls: newTotal,
    completedCalls: newCompleted,
    pendingCalls: newPending,
    responses: newResponses,
    successRate,
    lastUpdatedAt: new Date().toISOString(),
  };
}

function applyLiveStats(campaign: Campaign): Campaign {
  if (campaign.status !== "active") return campaign;
  const stats = simulateLiveStats(campaign.stats);
  const updated = { ...campaign, stats, updatedAt: stats.lastUpdatedAt };
  const index = campaignsDB.findIndex((c) => c.id === campaign.id);
  if (index !== -1) campaignsDB[index] = updated;
  return updated;
}

export function queryCampaigns(
  params: CampaignsQueryParams = {}
): PaginatedResponse<Campaign> {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "all",
    type = "all",
    sortBy = "createdAt",
    sortOrder = "desc",
    live = false,
  } = params;

  let filtered = [...campaignsDB];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.surveyName?.toLowerCase().includes(q) ||
        c.createdByName.toLowerCase().includes(q)
    );
  }

  if (status !== "all") filtered = filtered.filter((c) => c.status === status);
  if (type !== "all") filtered = filtered.filter((c) => c.type === type);

  filtered.sort((a, b) => {
    let aVal = "";
    let bVal = "";
    if (sortBy === "name") {
      aVal = a.name;
      bVal = b.name;
    } else {
      aVal = String(a[sortBy as keyof Campaign] ?? "");
      bVal = String(b[sortBy as keyof Campaign] ?? "");
    }
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  if (live) {
    filtered = filtered.map((c) =>
      c.status === "active" ? applyLiveStats(c) : c
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  const meta: PaginatedMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { data: filtered.slice(start, start + limit), meta };
}

export function getCampaignById(id: string, live = false): Campaign | undefined {
  const campaign = campaignsDB.find((c) => c.id === id);
  if (!campaign) return undefined;
  return live && campaign.status === "active"
    ? applyLiveStats(campaign)
    : campaign;
}

export function getCampaignStats(id: string): CampaignStats | null {
  const campaign = getCampaignById(id, true);
  return campaign?.stats ?? null;
}

export function getAggregateStats(): CampaignStats & { activeCount: number } {
  const active = campaignsDB.filter((c) => c.status === "active");
  const totals = campaignsDB.reduce(
    (acc, c) => ({
      totalCalls: acc.totalCalls + c.stats.totalCalls,
      completedCalls: acc.completedCalls + c.stats.completedCalls,
      failedCalls: acc.failedCalls + c.stats.failedCalls,
      pendingCalls: acc.pendingCalls + c.stats.pendingCalls,
      responses: acc.responses + c.stats.responses,
    }),
    {
      totalCalls: 0,
      completedCalls: 0,
      failedCalls: 0,
      pendingCalls: 0,
      responses: 0,
    }
  );

  const successRate =
    totals.completedCalls + totals.failedCalls > 0
      ? Math.round(
          (totals.completedCalls /
            (totals.completedCalls + totals.failedCalls)) *
            100
        )
      : 0;

  return {
    ...totals,
    successRate,
    avgDurationSeconds: 272,
    lastUpdatedAt: new Date().toISOString(),
    activeCount: active.length,
  };
}

export function createCampaign(payload: CreateCampaignPayload): Campaign {
  const now = new Date().toISOString();
  const isScheduled = payload.status === "scheduled" || payload.schedule;
  const status = payload.status ?? (isScheduled ? "scheduled" : "draft");

  const customerCount = payload.customerIds.length;
  const pendingCalls = customerCount * 10;

  const campaign: Campaign = {
    id: generateCampaignId(),
    name: payload.name,
    description: payload.description,
    type: payload.type,
    status,
    surveyId: payload.surveyId,
    surveyName: payload.surveyName,
    customerIds: payload.customerIds,
    customerCount,
    schedule: payload.schedule,
    stats: {
      totalCalls: 0,
      completedCalls: 0,
      failedCalls: 0,
      pendingCalls: status === "scheduled" ? pendingCalls : 0,
      successRate: 0,
      responses: 0,
      avgDurationSeconds: 0,
      lastUpdatedAt: now,
    },
    createdBy: "usr_001",
    createdByName: "Sarah Chen",
    createdAt: now,
    updatedAt: now,
  };

  campaignsDB = [campaign, ...campaignsDB];
  return campaign;
}

export function updateCampaignStatus(
  id: string,
  status: CampaignStatus
): Campaign | null {
  const index = campaignsDB.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const campaign = campaignsDB[index];
  const updated: Campaign = {
    ...campaign,
    status,
    updatedAt: new Date().toISOString(),
  };

  if (status === "active" && campaign.stats.totalCalls === 0) {
    updated.stats = {
      ...campaign.stats,
      pendingCalls: campaign.customerCount * 10,
      totalCalls: campaign.customerCount * 10,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  campaignsDB[index] = updated;
  return updated;
}

export function pauseCampaign(id: string): Campaign | null {
  const campaign = campaignsDB.find((c) => c.id === id);
  if (!campaign || campaign.status !== "active") return null;
  return updateCampaignStatus(id, "paused");
}

export function resumeCampaign(id: string): Campaign | null {
  const campaign = campaignsDB.find((c) => c.id === id);
  if (!campaign || campaign.status !== "paused") return null;
  return updateCampaignStatus(id, "active");
}

export function stopCampaign(id: string): Campaign | null {
  const campaign = campaignsDB.find((c) => c.id === id);
  if (
    !campaign ||
    !["active", "paused", "scheduled"].includes(campaign.status)
  )
    return null;
  return updateCampaignStatus(id, "stopped");
}

export function launchCampaign(id: string): Campaign | null {
  const campaign = campaignsDB.find((c) => c.id === id);
  if (!campaign || !["draft", "scheduled"].includes(campaign.status))
    return null;
  return updateCampaignStatus(id, "active");
}

export function retryFailedCalls(id: string): Campaign | null {
  const index = campaignsDB.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const campaign = campaignsDB[index];
  if (campaign.stats.failedCalls === 0) return null;

  const retryCount = Math.min(
    campaign.stats.failedCalls,
    Math.ceil(campaign.stats.failedCalls * 0.6)
  );
  const recovered = Math.floor(retryCount * 0.7);

  const updated: Campaign = {
    ...campaign,
    stats: {
      ...campaign.stats,
      failedCalls: campaign.stats.failedCalls - retryCount,
      completedCalls: campaign.stats.completedCalls + recovered,
      pendingCalls: campaign.stats.pendingCalls + (retryCount - recovered),
      successRate:
        campaign.stats.completedCalls + recovered > 0
          ? Math.round(
              ((campaign.stats.completedCalls + recovered) /
                (campaign.stats.completedCalls +
                  recovered +
                  campaign.stats.failedCalls -
                  retryCount)) *
                100
            )
          : campaign.stats.successRate,
      lastUpdatedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };

  campaignsDB[index] = updated;
  return updated;
}

export function deleteCampaign(id: string): boolean {
  const len = campaignsDB.length;
  campaignsDB = campaignsDB.filter((c) => c.id !== id);
  return campaignsDB.length < len;
}
