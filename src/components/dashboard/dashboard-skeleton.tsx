import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/60 bg-card p-4 shadow-card sm:p-5"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2.5 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
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

export function ListSkeleton({ rows = 5, showAvatar = false }: ListSkeletonProps) {
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
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <KpiGridSkeleton />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5 pt-5">
            <ChartSkeleton height={280} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 pt-5">
            <ChartSkeleton height={280} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 pt-5">
          <ChartSkeleton height={280} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5 pt-5">
            <ListSkeleton rows={5} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 pt-5">
            <ListSkeleton rows={4} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5 pt-5">
            <ListSkeleton rows={5} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 pt-5">
            <ListSkeleton rows={5} showAvatar />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
