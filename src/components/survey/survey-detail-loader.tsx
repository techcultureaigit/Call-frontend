"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAgentById } from "@/lib/data/agents-repository";
import type { Agent } from "@/types/agent";
import { SurveyDetailView } from "./survey-detail-view";

interface SurveyDetailLoaderProps {
  id: string;
}

export function SurveyDetailLoader({ id }: SurveyDetailLoaderProps) {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null | undefined>(undefined);

  useEffect(() => {
    setAgent(getAgentById(id) ?? null);
  }, [id]);

  if (agent === undefined) {
    return (
      <PageContainer size="full" className="pt-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64 rounded-[6px]" />
          <Skeleton className="h-[420px] w-full rounded-[6px]" />
        </div>
      </PageContainer>
    );
  }

  if (!agent) {
    return (
      <PageContainer size="full" className="pt-10">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-[6px] border border-dashed border-border/60 bg-card/60 px-6 py-16 text-center shadow-sm">
          <div className="mb-4 flex size-14 items-center justify-center rounded-[6px] bg-primary/10">
            <Bot className="size-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Survey not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This survey may have been deleted or is no longer available.
          </p>
          <Button
            className="mt-5 rounded-[6px]"
            onClick={() => router.push("/survey")}
          >
            Back to survey list
          </Button>
        </div>
      </PageContainer>
    );
  }

  return <SurveyDetailView agent={agent} />;
}
