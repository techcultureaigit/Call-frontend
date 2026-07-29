import { surveysApi, type SurveysListParams } from "@/api/surveys";
import {
  agentToBackendPayload,
  backendSurveyToAgent,
} from "@/lib/utils/survey-mapper";
import type { PaginatedMeta } from "@/types";
import type { Agent, AgentConfig, AgentSchedule } from "@/types/agent";

export interface SaveSurveyInput {
  id?: string;
  uuid: string;
  config: AgentConfig;
  status?: Agent["status"];
  step?: number;
}

export interface ScheduleSurveyInput {
  enabled?: boolean;
  startAt?: string;
  endAt?: string | null;
  timezone?: string;
  recurrence?: AgentSchedule["recurrence"];
}

export interface SurveysListResult {
  data: Agent[];
  meta: PaginatedMeta;
}

function toMeta(pagination?: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}): PaginatedMeta {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 9;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export const surveysModuleService = {
  async list(params: SurveysListParams = {}): Promise<SurveysListResult> {
    const res = await surveysApi.list({
      page: params.page ?? 1,
      limit: params.limit ?? 9,
      search: params.search || undefined,
      status: params.status,
    });

    return {
      data: (res.data ?? []).map(backendSurveyToAgent),
      meta: toMeta(res.pagination),
    };
  },

  async getById(id: string): Promise<Agent> {
    const res = await surveysApi.getById(id);
    return backendSurveyToAgent(res.data);
  },

  async save(
    input: SaveSurveyInput,
    schedule?: ScheduleSurveyInput | null
  ): Promise<Agent> {
    const payload = agentToBackendPayload(input, schedule);
    const res = await surveysApi.save(payload);
    return backendSurveyToAgent(res.data);
  },

  async delete(id: string): Promise<void> {
    await surveysApi.delete(id);
  },

  async bulkDelete(ids: string[]): Promise<{ deleted: number; failed: number }> {
    const results = await Promise.allSettled(
      ids.map((id) => surveysApi.delete(id))
    );
    const deleted = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - deleted;
    return { deleted, failed };
  },

  async duplicate(id: string): Promise<Agent> {
    const res = await surveysApi.duplicate(id);
    return backendSurveyToAgent(res.data);
  },

  async schedule(id: string, input: ScheduleSurveyInput): Promise<Agent> {
    const res = await surveysApi.schedule(
      id,
      input as unknown as Record<string, unknown>
    );
    return backendSurveyToAgent(res.data);
  },

  async unschedule(id: string): Promise<Agent> {
    const res = await surveysApi.unschedule(id);
    return backendSurveyToAgent(res.data);
  },

  async uploadContactFile(surveyId: string, file: File): Promise<Agent> {
    const res = await surveysApi.uploadContactFile(surveyId, file);
    return backendSurveyToAgent(res.data);
  },

  async uploadQuestionsFile(surveyId: string, file: File): Promise<Agent> {
    const res = await surveysApi.uploadQuestionsFile(surveyId, file);
    return backendSurveyToAgent(res.data);
  },
};
