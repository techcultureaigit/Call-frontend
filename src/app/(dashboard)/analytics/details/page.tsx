import { Suspense } from "react";
import { AnalyticsDetailsView } from "@/modules/reports/analytics-details-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      }
    >
      <AnalyticsDetailsView />
    </Suspense>
  );
}
