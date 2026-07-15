import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgentTemplatesLoading() {
  return (
    <PageContainer size="wide">
      <div className="space-y-8">
        <Skeleton className="h-10 w-96 max-w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
