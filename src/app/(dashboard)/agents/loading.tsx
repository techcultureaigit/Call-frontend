import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout";

export default function AgentsLoading() {
  return (
    <div className="-mx-4 bg-gradient-to-br from-sky-100/70 via-sky-50/50 to-blue-50/40 px-4 pt-6 pb-4 lg:-mx-8 lg:px-8">
      <PageContainer size="wide" className="space-y-6 px-0 py-0">
        <Skeleton className="h-9 w-40" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-11 flex-1 rounded-[6px]" />
          <Skeleton className="h-11 w-44 rounded-[6px]" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-[6px]" />
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
