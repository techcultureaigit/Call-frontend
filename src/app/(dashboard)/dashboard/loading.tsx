import { PageContainer } from "@/components/layout";
import { DashboardSkeleton } from "@/components/dashboard";

export default function DashboardLoading() {
  return (
    <PageContainer size="wide">
      <DashboardSkeleton />
    </PageContainer>
  );
}
