"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SortingState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { useDebounce, usePageMeta } from "@/hooks";
import { useCustomers, useCustomerMutations } from "@/hooks/use-customers";
import { customersToCSV, downloadCSV } from "@/lib/utils/csv";
import { CustomersToolbar } from "./customers-toolbar";
import {
  CustomersAdvancedFilters,
  type CustomerFilters,
} from "./customers-advanced-filters";
import { CustomersTable } from "./customers-table";
import { CustomersPagination } from "./customers-pagination";
import { CustomerDetailDrawer } from "./customer-detail-drawer";
import { CustomersBulkActions } from "./customers-bulk-actions";
import type { Customer, CustomerStatus } from "@/types/customer";

const DEFAULT_FILTERS: CustomerFilters = {
  status: "all",
  tier: "all",
  source: "all",
  ownerId: "all",
};

export function CustomersView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CustomerFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const sortBy = sorting[0]?.id ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isFetching } = useCustomers({
    page,
    limit: 10,
    search: debouncedSearch,
    status: filters.status,
    tier: filters.tier,
    source: filters.source,
    ownerId: filters.ownerId,
    sortBy: sortBy === "name" ? "name" : sortBy,
    sortOrder,
  });

  const { bulkDelete, bulkUpdateStatus, exportCustomers } =
    useCustomerMutations();

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Customers",
    breadcrumbs: [
      { label: "CRM", href: "/customers" },
      { label: "Customers" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  const handleClearAll = () => {
    setSearch("");
    setFilters(DEFAULT_FILTERS);
    setFiltersOpen(false);
  };

  const handleRowClick = (customer: Customer) => {
    setDetailCustomer(customer);
    setDetailOpen(true);
  };

  const handleExport = useCallback(async () => {
    try {
      const customers = await exportCustomers.mutateAsync({
        search: debouncedSearch,
        status: filters.status,
        tier: filters.tier,
        source: filters.source,
        ownerId: filters.ownerId,
        sortBy: sortBy === "name" ? "name" : sortBy,
        sortOrder,
      });
      const csv = customersToCSV(customers);
      downloadCSV(csv, `customers-export-${Date.now()}.csv`);
      toast.success(`Exported ${customers.length} customers`);
    } catch {
      toast.error("Export failed");
    }
  }, [debouncedSearch, filters, sortBy, sortOrder, exportCustomers]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await bulkDelete.mutateAsync(ids);
    setSelectedIds(new Set());
  }, [selectedIds, bulkDelete]);

  const handleBulkStatus = useCallback(
    async (status: CustomerStatus) => {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      await bulkUpdateStatus.mutateAsync({ ids, status });
      setSelectedIds(new Set());
    },
    [selectedIds, bulkUpdateStatus]
  );

  return (
    <PageContainer size="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <CustomersToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          filtersOpen={filtersOpen}
          onFiltersToggle={() => setFiltersOpen((v) => !v)}
          onClearAll={handleClearAll}
          onImportClick={() => router.push("/customers/import")}
          onExportClick={handleExport}
          isExporting={exportCustomers.isPending}
          totalCount={data?.meta.total}
        />

        <CustomersAdvancedFilters
          open={filtersOpen}
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setFiltersOpen(false)}
        />

        <CustomersTable
          customers={data?.data ?? []}
          isLoading={isLoading}
          sorting={sorting}
          onSortingChange={setSorting}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={handleRowClick}
        />

        {data?.meta && data.meta.total > 0 && (
          <CustomersPagination meta={data.meta} onPageChange={setPage} />
        )}

        {isFetching && !isLoading && (
          <div className="flex justify-center">
            <div className="size-1.5 animate-pulse rounded-full bg-primary" />
          </div>
        )}
      </motion.div>

      <CustomerDetailDrawer
        customer={detailCustomer}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <CustomersBulkActions
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkDelete={handleBulkDelete}
        onBulkStatus={handleBulkStatus}
        isDeleting={bulkDelete.isPending}
        isUpdating={bulkUpdateStatus.isPending}
      />
    </PageContainer>
  );
}
