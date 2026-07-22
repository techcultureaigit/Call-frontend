import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout";

export default function NotificationsLoading() {
  return (
    <PageContainer size="wide">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-[6px]" />
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-[6px]" />
        <Skeleton className="h-[480px] w-full rounded-[6px]" />
      </div>
    </PageContainer>
  );
}
