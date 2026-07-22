import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function KpiGridSkeleton({
  count = 6,
}: {
  count?: number;
  variant?: "voice" | "studio";
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-[6px] border border-border/50 bg-muted/30 p-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="space-y-3" style={{ height }}>
      <div className="flex h-full flex-col justify-end gap-2">
        <div className="flex items-end justify-between gap-2 px-2">
          {[45, 60, 35, 70, 55, 80, 40].map((h, i) => (
            <Skeleton
              key={i}
              className="w-full rounded-t-md"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between px-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-6" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ListSkeletonProps {
  rows?: number;
  showAvatar?: boolean;
}

export function ListSkeleton({
  rows = 5,
  showAvatar = false,
}: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          {showAvatar && <Skeleton className="size-9 shrink-0 rounded-full" />}
          {!showAvatar && <Skeleton className="size-8 shrink-0 rounded-lg" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3.5 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36 rounded-[6px]" />
          <Skeleton className="h-9 w-28 rounded-[6px]" />
          <Skeleton className="h-9 w-24 rounded-[6px]" />
        </div>
      </div>

      <Card className="border-border/60 p-5 shadow-card">
        <Skeleton className="mb-4 h-4 w-28" />
        <KpiGridSkeleton count={6} />
      </Card>

      <Card className="border-border/60 p-5 shadow-card">
        <Skeleton className="mb-4 h-4 w-28" />
        <KpiGridSkeleton count={6} />
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border-border/50 shadow-card xl:col-span-2">
          <CardContent className="p-5">
            <ChartSkeleton height={220} />
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-card">
          <CardContent className="p-5">
            <ChartSkeleton height={220} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
