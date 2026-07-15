import { Skeleton } from "@/components/ui/skeleton";

export default function SurveyBuilderLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col">
      <Skeleton className="h-14 w-full rounded-none" />
      <div className="flex flex-1">
        <Skeleton className="hidden w-72 rounded-none lg:block" />
        <Skeleton className="flex-1 rounded-none" />
        <Skeleton className="hidden w-72 rounded-none xl:block" />
      </div>
    </div>
  );
}
