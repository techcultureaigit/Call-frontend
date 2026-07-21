"use client";

import { LineChart } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function UsagePage() {
  return (
    <ModulePlaceholder
      title="Usage Details"
      description="Track API usage, call minutes, credits consumed, and billing metrics."
      icon={LineChart}
      backHref="/reports"
      backLabel="View Reports"
    />
  );
}
