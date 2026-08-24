import { SurveyDetailLoader } from "@/modules/survey";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SurveyDetailLoader id={id} />;
}
