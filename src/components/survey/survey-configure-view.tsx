"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { usePageMeta } from "@/hooks";
import {
  DEFAULT_AGENT_CONFIG,
  ENABLED_AGENT_CONFIG_TABS,
  isAgentConfigTabDisabled,
} from "@/lib/constants/agent-config";
import { generateAgentUuid } from "@/lib/data/mock-agents";
import { MOCK_SURVEY_TEMPLATES } from "@/lib/data/mock-survey-templates";
import { SurveyTopNav } from "./survey-top-nav";
import { SurveyConfigTabs } from "./survey-config-tabs";
import { SurveyConfigSidebar } from "./survey-config-sidebar";
import { SurveyConfigFooter } from "./survey-config-footer";
import { PersonaTab } from "./tabs/persona-tab";
import { PromptsTab } from "./tabs/prompts-tab";
import { WisdomTab } from "./tabs/wisdom-tab";
import { FunctionsTab } from "./tabs/functions-tab";
import { SurveyQuestionsTab } from "./tabs/survey-questions-tab";
import { ClientContactTab } from "./tabs/client-contact-tab";
import { PostCallTab } from "./tabs/post-call-tab";
import type { Agent, AgentConfig, AgentConfigTab } from "@/types/agent";

const ENABLED_TAB_ORDER = ENABLED_AGENT_CONFIG_TABS.map(
  (tab) => tab.id as AgentConfigTab
);

function buildInitialConfig(
  agent: Agent | null | undefined,
  templateId: string | null,
  isNew: boolean
): AgentConfig {
  const base = agent?.config
    ? structuredClone(agent.config)
    : structuredClone(DEFAULT_AGENT_CONFIG);

  if (!isNew || agent || !templateId) return base;

  const template = MOCK_SURVEY_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return base;

  return {
    ...base,
    persona: { ...base.persona, name: template.name },
    prompts: {
      ...base.prompts,
      systemPrompt: `${template.description}\n\nTone: ${template.tone}\nUse case: ${template.useCase}`,
      greeting: `Hello! I'm your ${template.name} assistant. How can I help you today?`,
    },
    wisdom: {
      ...base.wisdom,
      topics: [template.useCase, template.industryLabel],
    },
  };
}

interface SurveyConfigureViewProps {
  agent?: Agent | null;
  isNew?: boolean;
}

export function SurveyConfigureView({
  agent,
  isNew = false,
}: SurveyConfigureViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");

  const initialConfig = useMemo(
    () => buildInitialConfig(agent, templateId, isNew),
    [agent, templateId, isNew]
  );

  const [activeTab, setActiveTab] = useState<AgentConfigTab>(
    ENABLED_TAB_ORDER[0] ?? "persona"
  );
  const [showPreview, setShowPreview] = useState(false);
  const [uuid] = useState(agent?.uuid ?? generateAgentUuid());
  const [config, setConfig] = useState<AgentConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [templateNotice] = useState(() => {
    if (!isNew || agent || !templateId) return null;
    return MOCK_SURVEY_TEMPLATES.find((t) => t.id === templateId)?.name ?? null;
  });

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: isNew ? "Create Survey" : "Configure Survey",
    breadcrumbs: [
      { label: "Surveys", href: "/survey" },
      { label: isNew ? "Create New" : agent?.name ?? "Configure" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, isNew, agent?.name]);

  useEffect(() => {
    if (!templateNotice) return;
    toast.success(`Loaded "${templateNotice}" template`);
  }, [templateNotice]);

  const updateConfig = useCallback(
    <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const tabIndex = ENABLED_TAB_ORDER.indexOf(activeTab);
  const isFirst = tabIndex <= 0;
  const isLast = tabIndex === ENABLED_TAB_ORDER.length - 1;

  const handleBack = () => {
    if (tabIndex > 0) setActiveTab(ENABLED_TAB_ORDER[tabIndex - 1]);
  };

  const handleNext = async () => {
    if (!config.persona.name.trim() && activeTab === "persona") {
      toast.error("Please enter a survey name");
      return;
    }

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsSaving(false);

    if (isLast) {
      toast.success("Survey configuration saved");
      router.push("/survey");
      return;
    }

    setActiveTab(ENABLED_TAB_ORDER[tabIndex + 1]);
    toast.success("Saved — moving to next step");
  };

  const handleTabChange = (tab: AgentConfigTab) => {
    if (isAgentConfigTabDisabled(tab)) return;
    setActiveTab(tab);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "persona":
        return (
          <PersonaTab
            values={config.persona}
            onChange={(v) => updateConfig("persona", v)}
          />
        );
      case "prompts":
        return (
          <PromptsTab
            values={config.prompts}
            onChange={(v) => updateConfig("prompts", v)}
          />
        );
      case "wisdom":
        return (
          <WisdomTab
            values={config.wisdom}
            onChange={(v) => updateConfig("wisdom", v)}
          />
        );
      case "functions":
        return (
          <FunctionsTab
            values={config.functions}
            onChange={(v) => updateConfig("functions", v)}
          />
        );
      case "survey-questions":
        return (
          <SurveyQuestionsTab
            values={config.surveyQuestions}
            onChange={(v) => updateConfig("surveyQuestions", v)}
          />
        );
      case "client-contact":
        return (
          <ClientContactTab
            values={config.clientContact}
            onChange={(v) => updateConfig("clientContact", v)}
          />
        );
      case "post-call":
        return (
          <PostCallTab
            values={config.postCall}
            onChange={(v) => updateConfig("postCall", v)}
          />
        );
    }
  };

  return (
    <PageContainer
      size="full"
      className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4 pb-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <div className="shrink-0">
          <SurveyTopNav
            previewOpen={showPreview}
            onTogglePreview={() => setShowPreview((v) => !v)}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden xl:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
            <aside className="w-full shrink-0 rounded-[6px] border border-border/60 bg-card/70 p-3 shadow-card backdrop-blur-sm lg:w-[220px] lg:overflow-y-auto">
              <SurveyConfigTabs active={activeTab} onChange={handleTabChange} />
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[6px] border border-border/60 bg-card/70 shadow-card backdrop-blur-sm">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 lg:p-7">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderTab()}
                </motion.div>
              </div>

              <div className="shrink-0 border-t border-border/50 bg-card/90 px-5 py-4 sm:px-6 lg:px-7">
                <SurveyConfigFooter
                  onBack={handleBack}
                  onNext={handleNext}
                  isFirst={isFirst}
                  isLast={isLast}
                  isSaving={isSaving}
                  step={Math.max(tabIndex, 0) + 1}
                  total={ENABLED_TAB_ORDER.length}
                />
              </div>
            </div>
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            {showPreview && (
              <motion.div
                key="survey-preview"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 28 }}
                transition={{ type: "spring", stiffness: 300, damping: 34 }}
                className="w-full shrink-0 overflow-y-auto xl:w-[360px]"
              >
                <SurveyConfigSidebar
                  uuid={uuid}
                  agentName={config.persona.name}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </PageContainer>
  );
}
