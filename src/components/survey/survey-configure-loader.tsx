"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { surveysModuleService } from "@/services/surveys-module.service";
import { isSurveyCompleted } from "@/lib/utils/survey-readiness";
import type { Agent } from "@/types/agent";
import { SurveyConfigureView } from "./survey-configure-view";

interface SurveyConfigureLoaderProps {
  id: string;
}

export function SurveyConfigureLoader({ id }: SurveyConfigureLoaderProps) {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    surveysModuleService
      .getById(id)
      .then((a) => !cancelled && setAgent(a))
      .catch(() => !cancelled && setAgent(null));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (agent === undefined) {
    return (
      <PageContainer size="full" className="pt-6">
        <div className="min-h-[40vh]" aria-busy="true" aria-label="Loading survey" />
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

  if (isSurveyCompleted(agent)) {
    return (
      <PageContainer size="full" className="pt-10">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-[6px] border border-dashed border-border/60 bg-card/60 px-6 py-16 text-center shadow-sm">
          <div className="mb-4 flex size-14 items-center justify-center rounded-[6px] bg-primary/10">
            <Bot className="size-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Survey is completed</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Completed surveys cannot be edited. You can view details or copy
            this survey to create a new draft.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              className="rounded-[6px]"
              onClick={() => router.push(`/survey/${agent.id}`)}
            >
              View details
            </Button>
            <Button
              className="rounded-[6px]"
              onClick={() => router.push("/survey")}
            >
              Back to survey list
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return <SurveyConfigureView agent={agent} />;
}
