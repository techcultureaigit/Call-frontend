import type { Metadata } from "next";
import { Suspense } from "react";
import { ReportsView } from "@/modules/reports";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Survey analytics",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyAnalyticsPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-28 w-full" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </div>
      }
    >
      <ReportsView lockedSurveyId={id} />
    </Suspense>
  );
}
