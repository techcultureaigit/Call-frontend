import { apiDelete, apiGet, apiPost, apiPut } from "@/api/http";
import { createModuleApiCall } from "@/lib/api/module-helpers";
import type { ApiResponse } from "@/types/api";
import type { ProviderFormValues, ProviderItem, ProviderType } from "./provider-types";

const call = createModuleApiCall("providers");

interface ListResponse {
  success: boolean;
  data: ProviderItem[];
}

export async function listProviders(params: {
  type?: ProviderType;
  search?: string;
} = {}): Promise<ProviderItem[]> {
  const query = { ...params, limit: 200 };
  return call("listProviders", "GET", "/api/providers", async () => {
    const res = await apiGet<ListResponse>("/api/providers", query);
    return res.data ?? [];
  }, query);
}

export async function createProvider(input: ProviderFormValues) {
  return call("createProvider", "POST", "/api/providers", async () => {
    const res = await apiPost<ApiResponse<ProviderItem>>("/api/providers", input);
    if (!res.data) throw new Error("Failed to create");
    return res.data;
  });
}

export async function updateProvider(id: string, input: Partial<ProviderFormValues>) {
  return call("updateProvider", "PUT", `/api/providers/${id}`, async () => {
    const res = await apiPut<ApiResponse<ProviderItem>>(`/api/providers/${id}`, input);
    if (!res.data) throw new Error("Failed to update");
    return res.data;
  }, { id });
}

export async function deleteProvider(id: string) {
  return call("deleteProvider", "DELETE", `/api/providers/${id}`, async () => {
    await apiDelete(`/api/providers/${id}`);
  }, { id });
}
