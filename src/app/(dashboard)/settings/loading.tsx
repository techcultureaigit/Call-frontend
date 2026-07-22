import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <PageContainer size="wide">
      <div className="space-y-6">
        <Skeleton className="h-4 w-40 rounded-lg" />
        <Skeleton className="h-8 w-48 rounded-[6px]" />
        <Skeleton className="h-10 w-full max-w-lg rounded-[6px]" />
        <div className="flex gap-8">
          <div className="hidden w-56 space-y-2 lg:block">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-[6px]" />
            ))}
          </div>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-72 rounded-[6px]" />
            <Skeleton className="h-48 rounded-[6px]" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
