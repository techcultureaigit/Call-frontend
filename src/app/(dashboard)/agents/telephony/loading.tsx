import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout";

export default function TelephonyLoading() {
  return (
    <div className="-mx-4 bg-gradient-to-br from-sky-100/70 via-sky-50/50 to-blue-50/40 px-4 pt-6 pb-4 lg:-mx-8 lg:px-8">
      <PageContainer size="wide" className="space-y-6 px-0 py-0">
        <Skeleton className="h-9 w-80" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[480px] rounded-2xl lg:col-span-2" />
          <Skeleton className="h-[480px] rounded-2xl" />
        </div>
      </PageContainer>
    </div>
  );
}
