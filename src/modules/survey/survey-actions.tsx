"use client";

/**
 * survey-actions.tsx
 * Survey actions page. Route: /survey/actions
 * No API calls — mock UI only (see survey-actions-manager.tsx).
 */

import { PageContainer } from "@/components/layout";
import { usePageMeta } from "@/hooks";
import { motion } from "framer-motion";
import { useEffect } from "react";

import { AgentActionsManager } from "./survey-actions-manager";

export function SurveyActionsView() {
  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Survey Actions",
    breadcrumbs: [
      { label: "Surveys", href: "/survey" },
      { label: "Actions" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  return (
    <div className="bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer size="full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <AgentActionsManager title="Survey Actions Management" />
        </motion.div>
      </PageContainer>
    </div>
  );
}
