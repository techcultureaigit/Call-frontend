import {
  customersApi,
  type CustomersListParams,
} from "@/api/customers";
import { unwrapData } from "@/api/http";
import type { Customer, CustomerImportRow } from "@/types/customer";

export type { CustomersListParams };

export const customersModuleService = {
  list: (params: CustomersListParams = {}) => customersApi.list(params),
  export: (params: Omit<CustomersListParams, "page" | "limit">) =>
    unwrapData(customersApi.export(params)),
  getById: (id: string) => unwrapData(customersApi.getById(id)),
  bulkDelete: (ids: string[]) => unwrapData(customersApi.bulkDelete(ids)),
  bulkUpdateStatus: (ids: string[], status: Customer["status"]) =>
    unwrapData(customersApi.bulkUpdateStatus(ids, status)),
  importRows: (rows: CustomerImportRow[]) =>
    unwrapData(customersApi.importRows(rows)),
};
