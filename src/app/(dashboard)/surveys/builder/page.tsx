import { Suspense } from "react";
import { SurveyBuilderView } from "@/components/surveys";
import { Loader2 } from "lucide-react";

function BuilderFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function SurveyBuilderPage() {
  return (
    <Suspense fallback={<BuilderFallback />}>
      <SurveyBuilderView />
    </Suspense>
  );
}
