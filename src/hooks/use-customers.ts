"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/constants/query-keys";
import { customersApi, type CustomersListParams } from "@/api";
import type { CustomerImportRow, CustomerStatus } from "@/types/customer";

export function useCustomers(params: CustomersListParams) {
  return useQuery({
    queryKey: queryKeys.customers.module(params as Record<string, unknown>),
    queryFn: () => customersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["customers", "module"] });

  const bulkDelete = useMutation({
    mutationFn: (ids: string[]) => customersApi.bulkDelete(ids),
    onSuccess: (res) => {
      toast.success(`Deleted ${res.data.count} customers`);
      invalidate();
    },
    onError: () => toast.error("Bulk delete failed"),
  });

  const bulkUpdateStatus = useMutation({
    mutationFn: ({
      ids,
      status,
    }: {
      ids: string[];
      status: CustomerStatus;
    }) => customersApi.bulkUpdateStatus(ids, status),
    onSuccess: (res) => {
      toast.success(`Updated ${res.data.count} customers`);
      invalidate();
    },
    onError: () => toast.error("Bulk update failed"),
  });

  const importCustomers = useMutation({
    mutationFn: (rows: CustomerImportRow[]) =>
      customersApi.importRows(rows),
    onSuccess: (res) => {
      toast.success(
        `Imported ${res.data.imported} customers (${res.data.skipped} skipped)`
      );
      invalidate();
    },
    onError: () => toast.error("Import failed"),
  });

  const exportCustomers = useMutation({
    mutationFn: (params: Omit<CustomersListParams, "page" | "limit">) =>
      customersApi.export(params),
  });

  return {
    bulkDelete,
    bulkUpdateStatus,
    importCustomers,
    exportCustomers,
  };
}
