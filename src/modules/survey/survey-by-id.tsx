"use client";

/**
 * survey-by-id.tsx
 * Load one survey by id.
 * Route: /survey/[id], /survey/[id]/configure
 *
 * API calls in this file:
 *   getSurvey() → GET /api/surveys/:id
 */

import { getSurvey } from "./api";
import { SurveyCreateEditView } from "./survey-form";
import { SurveyDetailView } from "./survey-detail";
import { isSurveyCompleted } from "./survey-lib";
import { PageContainer } from "@/components/layout";
import { AppLoader } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import type { Agent as Survey } from "@/types/agent";
import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/** Viewport-centered popup while fetching by id (same as list / delete / save). */
export function SurveyFetchLoader({
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <AppLoader
      variant="page"
      label={label}
      hint="Fetching survey details"
    />
  );
}

/** Fetch survey once by id; returns undefined while loading */
export function useSurveyById(id: string) {
  const [survey, setSurvey] = useState<Survey | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setSurvey(undefined);

    (async () => {
      try {
        // API: getSurvey() → GET /api/surveys/:id
        const data = await getSurvey(id);
        if (!cancelled) setSurvey(data);
      } catch {
        if (!cancelled) setSurvey(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return survey;
}

function SurveyNotFound({ onBack }: { onBack: () => void }) {
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
        <Button className="mt-5 rounded-[6px]" onClick={onBack}>
          Back to survey list
        </Button>
      </div>
    </PageContainer>
  );
}

function SurveyByIdShell({
  id,
  children,
}: {
  id: string;
  children: (survey: Survey) => ReactNode;
}) {
  const router = useRouter();
  const survey = useSurveyById(id);

  if (survey === undefined) {
    return <SurveyFetchLoader label="Loading survey" />;
  }

  if (!survey) {
    return <SurveyNotFound onBack={() => router.push("/survey")} />;
  }

  return <>{children(survey)}</>;
}

/** Route: /survey/[id] — view details */
export function SurveyDetailLoader({ id }: { id: string }) {
  return (
    <SurveyByIdShell id={id}>
      {(survey) => <SurveyDetailView survey={survey} />}
    </SurveyByIdShell>
  );
}

/** Route: /survey/[id]/configure — edit existing survey */
export function SurveyCreateEditLoader({ id }: { id: string }) {
  const router = useRouter();

  return (
    <SurveyByIdShell id={id}>
      {(survey) => {
        if (isSurveyCompleted(survey)) {
          return (
            <PageContainer size="full" className="pt-10">
              <div className="mx-auto flex max-w-md flex-col items-center rounded-[6px] border border-dashed border-border/60 bg-card/60 px-6 py-16 text-center shadow-sm">
                <div className="mb-4 flex size-14 items-center justify-center rounded-[6px] bg-primary/10">
                  <Bot className="size-7 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Survey is completed</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Completed surveys cannot be edited. View details or copy to
                  create a new draft.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button
                    variant="outline"
                    className="rounded-[6px]"
                    onClick={() => router.push(`/survey/${survey.id}`)}
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
        return <SurveyCreateEditView survey={survey} />;
      }}
    </SurveyByIdShell>
  );
}
