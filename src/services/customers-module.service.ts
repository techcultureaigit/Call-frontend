import type { Customer, CustomerImportRow } from "@/types/customer";
import type { PaginatedResponse } from "@/types";
import { createQueryString } from "@/lib/utils";

export interface CustomersListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tier?: string;
  source?: string;
  ownerId?: string;
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

export const customersModuleService = {
  async list(params: CustomersListParams = {}) {
    const query = createQueryString(
      params as Record<string, string | number | boolean | undefined>
    );
    const response = await fetch(`/api/customers${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return handleResponse<PaginatedResponse<Customer>>(response);
  },

  async export(params: Omit<CustomersListParams, "page" | "limit">) {
    const query = createQueryString({
      ...params,
      export: "true",
    } as Record<string, string | undefined>);
    const response = await fetch(`/api/customers${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{ success: boolean; data: Customer[] }>(
      response
    );
    return json.data;
  },

  async getById(id: string) {
    const response = await fetch(`/api/customers/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await handleResponse<{ success: boolean; data: Customer }>(
      response
    );
    return json.data;
  },

  async bulkDelete(ids: string[]) {
    const response = await fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulk_delete", ids }),
    });
    return handleResponse<{ success: boolean; data: { count: number } }>(
      response
    );
  },

  async bulkUpdateStatus(ids: string[], status: Customer["status"]) {
    const response = await fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulk_status", ids, status }),
    });
    return handleResponse<{ success: boolean; data: { count: number } }>(
      response
    );
  },

  async importRows(rows: CustomerImportRow[]) {
    const response = await fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "import", rows }),
    });
    return handleResponse<{
      success: boolean;
      data: { imported: number; skipped: number };
    }>(response);
  },
};
