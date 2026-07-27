import type { PaginatedResponse } from "@/types";
import type { Customer, CustomerImportRow } from "@/types/customer";
import { apiEndpoints } from "./endpoints";
import { apiGet, apiPatch } from "./http";

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

export const customersApi = {
  list: (params: CustomersListParams = {}) =>
    apiGet<PaginatedResponse<Customer>>(apiEndpoints.customers.list, params),

  export: async (params: Omit<CustomersListParams, "page" | "limit">) => {
    const json = await apiGet<{ success: boolean; data: Customer[] }>(
      apiEndpoints.customers.list,
      { ...params, export: "true" }
    );
    return json.data;
  },

  getById: async (id: string) => {
    const json = await apiGet<{ success: boolean; data: Customer }>(
      apiEndpoints.customers.detail(id)
    );
    return json.data;
  },

  bulkDelete: (ids: string[]) =>
    apiPatch<{ success: boolean; data: { count: number } }>(
      apiEndpoints.customers.list,
      { action: "bulk_delete", ids }
    ),

  bulkUpdateStatus: (ids: string[], status: Customer["status"]) =>
    apiPatch<{ success: boolean; data: { count: number } }>(
      apiEndpoints.customers.list,
      { action: "bulk_status", ids, status }
    ),

  importRows: (rows: CustomerImportRow[]) =>
    apiPatch<{
      success: boolean;
      data: { imported: number; skipped: number };
    }>(apiEndpoints.customers.list, { action: "import", rows }),
};
