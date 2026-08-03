import { AppLoader } from "@/components/ui/app-loader";

export default function NewSurveyLoading() {
  return (
    <div className="p-4">
      <AppLoader variant="page" label="Loading survey form" />
    </div>
  );
}
