import { SurveyResultDetailView } from "@/components/survey/survey-result-detail-view";

interface PageProps {
  params: Promise<{ id: string; resultId: string }>;
}

export default async function SurveyResultDetailPage({ params }: PageProps) {
  const { id, resultId } = await params;
  return <SurveyResultDetailView surveyId={id} resultId={resultId} />;
}
