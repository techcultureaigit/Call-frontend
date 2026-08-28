import { Suspense } from "react";
import { AnalyticsSurveysView } from "@/modules/reports/analytics-surveys-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsSurveysPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      }
    >
      <AnalyticsSurveysView />
    </Suspense>
  );
}
