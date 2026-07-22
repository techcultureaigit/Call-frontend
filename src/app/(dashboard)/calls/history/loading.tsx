import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout";

export default function CallsLoading() {
  return (
    <PageContainer size="wide">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-[6px]" />
          ))}
        </div>
        <Skeleton className="h-[72px] w-full rounded-[6px]" />
        <Skeleton className="h-[480px] w-full rounded-[6px]" />
      </div>
    </PageContainer>
  );
}
