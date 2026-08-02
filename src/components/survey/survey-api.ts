/**
 * Survey API — open this file to see every survey request.
 * Plain axios calls to Next.js `/api/surveys` (BFF → backend).
 */
import axios from "axios";
import { DEFAULT_AGENT_CONFIG } from "@/lib/constants/agent-config";
import { getAccessTokenFromCookie } from "@/lib/auth/session";
import {
  agentToBackendPayload,
  backendSurveyToAgent,
} from "@/lib/utils/survey-mapper";
import type { Agent, AgentConfig, AgentSchedule } from "@/types/agent";
import type { SurveyQuestion } from "@/types/survey";
import { builderQuestionsToAgent } from "../surveys/survey-question-map";

const URL = "/api/surveys";

/** Auth header for every request */
function headers() {
  const token = getAccessTokenFromCookie();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type ScheduleInput = {
  enabled?: boolean;
  startAt?: string;
  endAt?: string | null;
  timezone?: string;
  recurrence?: AgentSchedule["recurrence"];
};

export type SaveInput = {
  id?: string;
  config: AgentConfig;
  status?: Agent["status"];
  step?: number;
};

/** GET /api/surveys — list */
export async function listSurveys(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
} = {}) {
  const { data } = await axios.get(URL, {
    headers: headers(),
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 9,
      search: params.search || undefined,
      status: params.status,
    },
  });

  const page = data.pagination?.page ?? 1;
  const limit = data.pagination?.limit ?? 9;
  const total = data.pagination?.total ?? 0;
  const totalPages = data.pagination?.totalPages ?? 1;

  return {
    data: (data.data ?? []).map(backendSurveyToAgent) as Agent[],
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/** GET /api/surveys/:id */
export async function getSurvey(id: string) {
  const { data } = await axios.get(`${URL}/${id}`, { headers: headers() });
  return backendSurveyToAgent(data.data) as Agent;
}

/** POST /api/surveys — create or update */
export async function saveSurvey(
  input: SaveInput,
  schedule?: ScheduleInput | null
) {
  const { data } = await axios.post(
    URL,
    agentToBackendPayload(input, schedule),
    { headers: headers() }
  );
  return backendSurveyToAgent(data.data) as Agent;
}

/** DELETE /api/surveys/:id */
export async function deleteSurvey(id: string) {
  await axios.delete(`${URL}/${id}`, { headers: headers() });
}

/** Delete many surveys */
export async function bulkDeleteSurveys(ids: string[]) {
  const results = await Promise.allSettled(ids.map((id) => deleteSurvey(id)));
  const deleted = results.filter((r) => r.status === "fulfilled").length;
  return { deleted, failed: results.length - deleted };
}

/** POST /api/surveys/:id/duplicate */
export async function duplicateSurvey(id: string) {
  const { data } = await axios.post(`${URL}/${id}/duplicate`, null, {
    headers: headers(),
  });
  return backendSurveyToAgent(data.data) as Agent;
}

/** POST /api/surveys/:id/schedule */
export async function scheduleSurvey(id: string, input: ScheduleInput) {
  const { data } = await axios.post(`${URL}/${id}/schedule`, input, {
    headers: headers(),
  });
  return backendSurveyToAgent(data.data) as Agent;
}

/** POST /api/surveys/:id/unschedule */
export async function unscheduleSurvey(id: string) {
  const { data } = await axios.post(`${URL}/${id}/unschedule`, null, {
    headers: headers(),
  });
  return backendSurveyToAgent(data.data) as Agent;
}

/** POST /api/surveys/:id/contact-file */
export async function uploadContactFile(surveyId: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await axios.post(`${URL}/${surveyId}/contact-file`, fd, {
    headers: headers(),
  });
  return backendSurveyToAgent(data.data) as Agent;
}

/** POST /api/surveys/:id/questions-file */
export async function uploadQuestionsFile(surveyId: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await axios.post(`${URL}/${surveyId}/questions-file`, fd, {
    headers: headers(),
  });
  return backendSurveyToAgent(data.data) as Agent;
}

/** Create a new draft survey (builder) */
export async function createDraftSurvey(name = "Untitled Survey") {
  return saveSurvey({
    status: "draft",
    config: {
      ...DEFAULT_AGENT_CONFIG,
      persona: {
        ...DEFAULT_AGENT_CONFIG.persona,
        name: name.trim() || "Untitled Survey",
      },
    },
  });
}

/** Save builder questions onto an existing survey */
export async function saveBuilderSurvey(
  id: string,
  payload: {
    name: string;
    questions: SurveyQuestion[];
    status?: Agent["status"];
  }
) {
  const existing = await getSurvey(id);
  return saveSurvey({
    id,
    status: payload.status ?? existing.status,
    config: {
      ...existing.config,
      persona: {
        ...existing.config.persona,
        name: payload.name.trim() || existing.name,
      },
      surveyQuestions: {
        ...existing.config.surveyQuestions,
        enabled: true,
        questionsFileUrl: "",
        questionsFileName: "",
        questions: builderQuestionsToAgent(payload.questions),
      },
    },
  });
}

/** Publish or unpublish */
export async function setSurveyPublished(id: string, published: boolean) {
  const existing = await getSurvey(id);
  return saveSurvey({
    id,
    config: existing.config,
    status: published ? "active" : "draft",
  });
}
