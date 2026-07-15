import type {
  CreateSurveyPayload,
  SaveSurveyPayload,
  Survey,
  SurveyDetail,
} from "@/types/survey";
import { createQueryString } from "@/lib/utils";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ?? "Request failed"
    );
  }
  return response.json() as Promise<T>;
}

export const surveysModuleService = {
  async list(activeOnly = false, search = "") {
    const query = createQueryString({
      active: activeOnly ? "true" : undefined,
      search: search || undefined,
    });
    const response = await fetch(`/api/surveys${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{ success: boolean; data: Survey[] }>(
      response
    );
    return json.data;
  },

  async getById(id: string) {
    const response = await fetch(`/api/surveys/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{ success: boolean; data: SurveyDetail }>(
      response
    );
    return json.data;
  },

  async create(payload: CreateSurveyPayload) {
    const response = await fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await handleResponse<{ success: boolean; data: SurveyDetail }>(
      response
    );
    return json.data;
  },

  async save(id: string, payload: SaveSurveyPayload) {
    const response = await fetch(`/api/surveys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await handleResponse<{ success: boolean; data: SurveyDetail }>(
      response
    );
    return json.data;
  },

  async togglePublish(id: string, published: boolean) {
    const response = await fetch(`/api/surveys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish", published }),
    });
    const json = await handleResponse<{ success: boolean; data: SurveyDetail }>(
      response
    );
    return json.data;
  },

  async delete(id: string) {
    const response = await fetch(`/api/surveys/${id}`, { method: "DELETE" });
    return handleResponse<{ success: boolean }>(response);
  },
};
