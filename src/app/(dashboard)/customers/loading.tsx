import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout";

export default function CustomersLoading() {
  return (
    <PageContainer size="wide">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-[72px] w-full rounded-xl" />
        <Skeleton className="h-[480px] w-full rounded-xl" />
      </div>
    </PageContainer>
  );
}
