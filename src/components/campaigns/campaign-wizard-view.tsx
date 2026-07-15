"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout";
import { FormPageHeader } from "@/components/shared/form-page-header";
import { usePageMeta, useCampaignMutations } from "@/hooks";
import { CampaignWizard } from "./campaign-wizard";
import type { CampaignWizardValues } from "@/types/campaign";

export function CampaignWizardView() {
  const router = useRouter();
  const { createCampaign } = useCampaignMutations();

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Create Campaign",
    breadcrumbs: [
      { label: "Engagement", href: "/campaigns" },
      { label: "Campaigns", href: "/campaigns" },
      { label: "Create" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  const handleSubmit = useCallback(
    async (values: CampaignWizardValues, launch: boolean) => {
      const surveyRes = await fetch("/api/surveys?active=true");
      const surveyJson = await surveyRes.json();
      const survey = (
        surveyJson.data as { id: string; name: string }[]
      ).find((s) => s.id === values.surveyId);

      await createCampaign.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        type: values.type,
        surveyId: values.surveyId,
        surveyName: survey?.name ?? "Survey",
        customerIds: values.customerIds,
        schedule: {
          ...values.schedule,
          endDate: values.schedule.endDate || undefined,
        },
        status: launch ? "active" : "draft",
      });

      router.push("/campaigns");
    },
    [createCampaign, router]
  );

  const isLoading = createCampaign.isPending;

  return (
    <PageContainer size="full">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full space-y-6"
      >
        <FormPageHeader
          backHref="/campaigns"
          backLabel="Back to campaigns"
          title="Create Campaign"
          description="Set up your campaign in 5 simple steps."
        />

        <CampaignWizard
          variant="page"
          onSubmit={handleSubmit}
          onCancel={() => router.push("/campaigns")}
          isLoading={isLoading}
        />
      </motion.div>
    </PageContainer>
  );
}
