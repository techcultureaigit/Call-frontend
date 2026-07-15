import { PageContainer } from "@/components/layout";
import { TemplatesGridSkeleton } from "@/components/campaign-templates/templates-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignTemplatesLoading() {
  return (
    <PageContainer size="wide">
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-2xl" />
          ))}
        </div>
        <TemplatesGridSkeleton />
      </div>
    </PageContainer>
  );
}
