import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout";

export default function ReportsLoading() {
  return (
    <PageContainer size="wide">
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-[6px]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[6px]" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-[6px]" />
          <Skeleton className="h-80 rounded-[6px]" />
        </div>
      </div>
    </PageContainer>
  );
}
