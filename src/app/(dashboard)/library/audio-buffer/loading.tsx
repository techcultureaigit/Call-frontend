import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout";

export default function AudioBufferLoading() {
  return (
    <div className="-mx-4 bg-gradient-to-br from-sky-100/70 via-sky-50/50 to-blue-50/40 px-4 pt-6 pb-4 lg:-mx-8 lg:px-8">
      <PageContainer size="wide" className="space-y-6 px-0 py-0">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-[480px] rounded-2xl" />
      </PageContainer>
    </div>
  );
}
