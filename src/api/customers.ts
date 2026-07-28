import type { PaginatedResponse } from "@/types";
import type { ApiResponse } from "@/types/api";
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

/** Raw HTTP only — services unwrap `data` */
export const customersApi = {
  list: (params: CustomersListParams = {}) =>
    apiGet<PaginatedResponse<Customer>>(apiEndpoints.customers.list, params),

  export: (params: Omit<CustomersListParams, "page" | "limit">) =>
    apiGet<ApiResponse<Customer[]>>(apiEndpoints.customers.list, {
      ...params,
      export: "true",
    }),

  getById: (id: string) =>
    apiGet<ApiResponse<Customer>>(apiEndpoints.customers.detail(id)),

  bulkDelete: (ids: string[]) =>
    apiPatch<ApiResponse<{ count: number }>>(apiEndpoints.customers.list, {
      action: "bulk_delete",
      ids,
    }),

  bulkUpdateStatus: (ids: string[], status: Customer["status"]) =>
    apiPatch<ApiResponse<{ count: number }>>(apiEndpoints.customers.list, {
      action: "bulk_status",
      ids,
      status,
    }),

  importRows: (rows: CustomerImportRow[]) =>
    apiPatch<ApiResponse<{ imported: number; skipped: number }>>(
      apiEndpoints.customers.list,
      { action: "import", rows }
    ),
};
