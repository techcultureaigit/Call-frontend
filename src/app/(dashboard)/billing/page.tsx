"use client";

import { Receipt } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function BillingPage() {
  return (
    <ModulePlaceholder
      title="Billing"
      description="Manage subscriptions, invoices, payment methods, and usage-based billing."
      icon={Receipt}
      backHref="/settings"
      backLabel="Go to Settings"
    />
  );
}
