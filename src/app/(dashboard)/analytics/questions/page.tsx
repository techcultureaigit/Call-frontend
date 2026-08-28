import { Suspense } from "react";
import { AnalyticsQuestionsView } from "@/modules/reports/analytics-questions-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsQuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-72" />
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-5">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
            <Skeleton className="h-96 w-full lg:col-span-7" />
          </div>
        </div>
      }
    >
      <AnalyticsQuestionsView />
    </Suspense>
  );
}
