"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { surveysModuleService } from "@/services/surveys-module.service";
import type { Agent } from "@/types/agent";
import { SurveyDetailView } from "./survey-detail-view";

interface SurveyDetailLoaderProps {
  id: string;
}

export function SurveyDetailLoader({ id }: SurveyDetailLoaderProps) {
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

  return <SurveyDetailView agent={agent} />;
}
