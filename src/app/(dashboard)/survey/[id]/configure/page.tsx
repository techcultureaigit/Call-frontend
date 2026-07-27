import { notFound } from "next/navigation";
import { SurveyConfigureView } from "@/components/survey";
import { getAgentById } from "@/lib/data/mock-agents";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyConfigurePage({ params }: PageProps) {
  const { id } = await params;
  const agent = getAgentById(id);
  if (!agent) notFound();
  return <SurveyConfigureView agent={agent} />;
}
