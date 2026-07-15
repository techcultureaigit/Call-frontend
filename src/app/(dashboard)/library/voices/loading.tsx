import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout";

export default function VoicesLoading() {
  return (
    <div className="-mx-4 bg-gradient-to-br from-sky-100/70 via-sky-50/50 to-blue-50/40 px-4 pt-6 pb-4 lg:-mx-8 lg:px-8">
      <PageContainer size="wide" className="space-y-6 px-0 py-0">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-[520px] rounded-2xl" />
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
