import { SurveyConfigureLoader } from "@/modules/survey";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyConfigurePage({ params }: PageProps) {
  const { id } = await params;
  return <SurveyConfigureLoader id={id} />;
}
