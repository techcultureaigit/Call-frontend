import { SurveyResultsView } from "@/modules/survey";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyResultsPage({ params }: PageProps) {
  const { id } = await params;
  return <SurveyResultsView surveyId={id} />;
}
