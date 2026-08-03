import { Suspense } from "react";
import { SurveyBuilderView } from "@/components/surveys";
import { AppLoader } from "@/components/ui/app-loader";

export default function SurveyBuilderPage() {
  return (
    <Suspense
      fallback={
        <AppLoader
          variant="section"
          label="Loading builder"
          className="m-4"
        />
      }
    >
      <SurveyBuilderView />
    </Suspense>
  );
}
