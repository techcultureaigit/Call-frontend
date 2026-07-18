"use client";

import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListSkeleton } from "./dashboard-skeleton";
import { DashboardCard } from "./dashboard-card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import type { RecentCustomer } from "@/types/dashboard";

const statusStyles: Record<RecentCustomer["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  lead: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

interface RecentCustomersProps {
  customers: RecentCustomer[];
  isLoading?: boolean;
}

export function RecentCustomers({ customers, isLoading }: RecentCustomersProps) {
  if (isLoading) {
    return (
      <DashboardCard title="Recent Customers" description="Latest customer interactions">
        <ListSkeleton rows={5} showAvatar />
      </DashboardCard>
    );
  }

  if (customers.length === 0) {
    return (
      <DashboardCard title="Recent Customers" description="Latest customer interactions">
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Recently contacted customers will appear here."
          compact
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Recent Customers"
      description="Latest customer interactions"
      icon={Users}
    >
      <ul className="space-y-1">
        {customers.map((customer, index) => {
          const [firstName, ...rest] = customer.name.split(" ");
          const lastName = rest.join(" ");

          return (
            <li
              key={customer.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40",
                index !== customers.length - 1 && "border-b border-border/40"
              )}
            >
              <Avatar className="size-9">
                {customer.avatarUrl && (
                  <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                )}
                <AvatarFallback className="bg-primary/8 text-xs font-medium text-primary">
                  {getInitials(firstName, lastName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{customer.name}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize",
                      statusStyles[customer.status]
                    )}
                  >
                    {customer.status}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {customer.company ?? customer.email}
                </p>
              </div>

              <span className="shrink-0 text-[10px] text-muted-foreground/70">
                {formatRelativeTime(customer.lastContactAt)}
              </span>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
