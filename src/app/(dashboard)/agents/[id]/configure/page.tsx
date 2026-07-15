import { notFound } from "next/navigation";
import { AgentConfigureView } from "@/components/agents";
import { getAgentById } from "@/lib/data/mock-agents";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentConfigurePage({ params }: PageProps) {
  const { id } = await params;
  const agent = getAgentById(id);
  if (!agent) notFound();
  return <AgentConfigureView agent={agent} />;
}
