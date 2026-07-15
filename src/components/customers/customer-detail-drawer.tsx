"use client";

import {
  Building2,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Phone,
  Tag,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getInitials,
} from "@/lib/utils";
import { CustomerStatusBadge } from "./customer-status-badge";
import { TierBadge } from "./tier-badge";
import type { Customer } from "@/types/customer";

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  if (!value || value === "—") return null;
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm">{value}</p>
      </div>
    </div>
  );
}

export function CustomerDetailDrawer({
  customer,
  open,
  onOpenChange,
}: CustomerDetailDrawerProps) {
  if (!customer) return null;

  const location = [customer.city, customer.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            {customer.avatarUrl && (
              <AvatarImage src={customer.avatarUrl} alt={customer.firstName} />
            )}
            <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
              {getInitials(customer.firstName, customer.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-tight">
              {customer.firstName} {customer.lastName}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {customer.jobTitle
                ? `${customer.jobTitle} at ${customer.company}`
                : customer.company}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CustomerStatusBadge status={customer.status} />
              <TierBadge tier={customer.tier} />
            </div>
          </div>
        </div>
      </SheetHeader>

      <SheetContent>
        <div className="space-y-6">
          <div className="grid gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Lifetime Value
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {formatCurrency(customer.lifetimeValue)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <span className="text-xs text-muted-foreground">Owner</span>
              <span className="text-sm font-medium">{customer.ownerName}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <span className="text-xs text-muted-foreground">Source</span>
              <span className="text-sm capitalize">{customer.source}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact Details
            </h3>
            <DetailRow icon={Mail} label="Email" value={customer.email} />
            <DetailRow icon={Phone} label="Phone" value={customer.phone} />
            <DetailRow icon={Building2} label="Company" value={customer.company} />
            <DetailRow icon={User} label="Job Title" value={customer.jobTitle} />
            <DetailRow icon={MapPin} label="Location" value={location} />
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Activity
            </h3>
            <DetailRow
              icon={Calendar}
              label="Last Contact"
              value={
                customer.lastContactAt
                  ? formatRelativeTime(customer.lastContactAt)
                  : "—"
              }
            />
            <DetailRow
              icon={Calendar}
              label="Created"
              value={formatDate(customer.createdAt)}
            />
            <DetailRow
              icon={Globe}
              label="Customer ID"
              value={
                <span className="font-mono text-xs text-muted-foreground">
                  {customer.id}
                </span>
              }
            />
          </div>

          {customer.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Tag className="size-3" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {customer.notes && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </h3>
              <p className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm leading-relaxed text-muted-foreground">
                {customer.notes}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
