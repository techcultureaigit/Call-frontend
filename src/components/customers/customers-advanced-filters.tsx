"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  CUSTOMER_OWNERS,
  CUSTOMER_SOURCE_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
  CUSTOMER_TIER_OPTIONS,
} from "@/lib/constants/customers";
import type {
  CustomerSource,
  CustomerStatus,
  CustomerTier,
} from "@/types/customer";

export interface CustomerFilters {
  status: CustomerStatus | "all";
  tier: CustomerTier | "all";
  source: CustomerSource | "all";
  ownerId: string | "all";
}

interface CustomersAdvancedFiltersProps {
  open: boolean;
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onClose: () => void;
}

export function CustomersAdvancedFilters({
  open,
  filters,
  onFiltersChange,
  onClose,
}: CustomersAdvancedFiltersProps) {
  const activeCount = [
    filters.status !== "all",
    filters.tier !== "all",
    filters.source !== "all",
    filters.ownerId !== "all",
  ].filter(Boolean).length;

  const update = (patch: Partial<CustomerFilters>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  const clearAll = () => {
    onFiltersChange({
      status: "all",
      tier: "all",
      source: "all",
      ownerId: "all",
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Advanced Filters</span>
                {activeCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-7 text-xs text-muted-foreground"
                  >
                    Reset filters
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  className="size-7"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onChange={(e) =>
                    update({
                      status: e.target.value as CustomerStatus | "all",
                    })
                  }
                  options={[
                    { label: "All Statuses", value: "all" },
                    ...CUSTOMER_STATUS_OPTIONS,
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Tier
                </label>
                <Select
                  value={filters.tier}
                  onChange={(e) =>
                    update({ tier: e.target.value as CustomerTier | "all" })
                  }
                  options={[
                    { label: "All Tiers", value: "all" },
                    ...CUSTOMER_TIER_OPTIONS,
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Source
                </label>
                <Select
                  value={filters.source}
                  onChange={(e) =>
                    update({
                      source: e.target.value as CustomerSource | "all",
                    })
                  }
                  options={[
                    { label: "All Sources", value: "all" },
                    ...CUSTOMER_SOURCE_OPTIONS,
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Owner
                </label>
                <Select
                  value={filters.ownerId}
                  onChange={(e) => update({ ownerId: e.target.value })}
                  options={[
                    { label: "All Owners", value: "all" },
                    ...CUSTOMER_OWNERS.map((o) => ({
                      label: o.name,
                      value: o.id,
                    })),
                  ]}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
