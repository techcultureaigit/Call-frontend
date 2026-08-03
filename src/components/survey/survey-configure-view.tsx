"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { usePageMeta, usePermissions, useSurveyTemplateDetail } from "@/hooks";
import {
  DEFAULT_AGENT_CONFIG,
  ENABLED_AGENT_CONFIG_TABS,
  isAgentConfigTabDisabled,
} from "@/lib/constants/agent-config";
import { surveysModuleService } from "@/services/surveys-module.service";
import { buildSystemPromptFromTemplate } from "@/lib/data/mock-survey-templates";
import { computeSurveyProgress } from "@/lib/utils/survey-progress";
import {
  isSurveyReadyToSchedule,
  type SurveyDisplayStatus,
} from "@/lib/utils/survey-readiness";
import { SurveyTopNav } from "./survey-top-nav";
import { SurveyConfigTabs } from "./survey-config-tabs";
import { SurveyConfigSidebar } from "./survey-config-sidebar";
import { SurveyConfigFooter } from "./survey-config-footer";
import {
  createEmptyScheduleForm,
  parseScheduleForm,
  scheduleToFormValues,
  type ScheduleFormValues,
} from "./survey-schedule-fields";
import { PersonaTab } from "./tabs/persona-tab";
import { PromptsTab } from "./tabs/prompts-tab";
import { WisdomTab } from "./tabs/wisdom-tab";
import { FunctionsTab } from "./tabs/functions-tab";
import { SurveyQuestionsTab } from "./tabs/survey-questions-tab";
import { FarewellTab } from "./tabs/farewell-tab";
import { ClientContactTab } from "./tabs/client-contact-tab";
import { ScheduleTab } from "./tabs/schedule-tab";
import { PostCallTab } from "./tabs/post-call-tab";
import type { Agent, AgentConfig, AgentConfigTab } from "@/types/agent";
import type { SurveyTemplate } from "@/types/survey-template";

const ENABLED_TAB_ORDER = ENABLED_AGENT_CONFIG_TABS.map(
  (tab) => tab.id as AgentConfigTab
);

type StepRequirementKey =
  | "identity"
  | "prompts"
  | "survey-questions"
  | "farewell"
  | "client-contact"
  | "schedule";

const TAB_REQUIRED_KEYS: Record<AgentConfigTab, StepRequirementKey[]> = {
  persona: ["identity"],
  prompts: ["identity", "prompts"],
  "survey-questions": ["identity", "prompts", "survey-questions"],
  farewell: ["identity", "prompts", "survey-questions"],
  "client-contact": [
    "identity",
    "prompts",
    "survey-questions",
    "client-contact",
  ],
  schedule: ["identity", "prompts", "survey-questions", "client-contact"],
  wisdom: ["identity", "prompts", "survey-questions", "client-contact"],
  "post-call": ["identity", "prompts", "survey-questions", "client-contact"],
  functions: ["identity", "prompts", "survey-questions", "client-contact"],
};

const STEP_LABELS: Record<StepRequirementKey, string> = {
  identity: "Identity",
  prompts: "Instructions",
  "survey-questions": "Survey Questions",
  farewell: "Farewell",
  "client-contact": "Contact of Client",
  schedule: "Schedule",
};

const TAB_TO_PROGRESS_KEY: Partial<Record<AgentConfigTab, StepRequirementKey>> = {
  persona: "identity",
  prompts: "prompts",
  "survey-questions": "survey-questions",
  farewell: "farewell",
  "client-contact": "client-contact",
  schedule: "schedule",
};

function applyTemplateToConfig(
  base: AgentConfig,
  template: SurveyTemplate
): AgentConfig {
  return {
    ...base,
    persona: { ...base.persona, name: template.name },
    prompts: {
      ...base.prompts,
      systemPrompt: buildSystemPromptFromTemplate(template),
      greeting: template.greeting,
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
  const { canCreateSurvey, canUpdateSurvey } = usePermissions();
  const templateId = searchParams.get("template");
  const shouldLoadTemplate = Boolean(isNew && !agent && templateId);

  const { data: template } = useSurveyTemplateDetail(
    shouldLoadTemplate ? templateId : null
  );

  const baseConfig = useMemo(() => {
    return agent?.config
      ? structuredClone(agent.config)
      : structuredClone(DEFAULT_AGENT_CONFIG);
  }, [agent]);

  const [activeTab, setActiveTab] = useState<AgentConfigTab>(
    ENABLED_TAB_ORDER[0] ?? "persona"
  );
  const [showPreview, setShowPreview] = useState(false);
  const [surveyId, setSurveyId] = useState(agent?.id);
  const [config, setConfig] = useState<AgentConfig>(baseConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [templateApplied, setTemplateApplied] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormValues>(() =>
    agent ? scheduleToFormValues(agent.schedule) : createEmptyScheduleForm()
  );

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

  // Block create flow when role lacks surveys:create
  useEffect(() => {
    if (isNew && !canCreateSurvey) {
      toast.error("You do not have permission to create surveys");
      router.replace("/survey");
    }
  }, [isNew, canCreateSurvey, router]);

  // Block edit flow when role lacks surveys:update
  useEffect(() => {
    if (!isNew && agent && !canUpdateSurvey) {
      toast.error("You do not have permission to edit surveys");
      router.replace(`/survey/${agent.id}`);
    }
  }, [isNew, agent, canUpdateSurvey, router]);

  useEffect(() => {
    if (!template || templateApplied) return;
    setConfig(applyTemplateToConfig(baseConfig, template));
    setTemplateApplied(true);
    toast.success(`Loaded "${template.name}" template`);
  }, [template, templateApplied, baseConfig]);

  const updateConfig = useCallback(
    <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const computedProgress = useMemo(
    () =>
      computeSurveyProgress(config, {
        enabled: scheduleForm.enabled,
        startAt: scheduleForm.startAt || null,
        endAt: scheduleForm.endAt || null,
        timezone: scheduleForm.timezone || "Asia/Kolkata",
        recurrence: scheduleForm.recurrence,
        status: "idle",
        lastScheduledAt: null,
      }),
    [config, scheduleForm]
  );

  const displayStatus = useMemo((): SurveyDisplayStatus => {
    if (agent?.scheduling_status) return agent.scheduling_status;
    if (scheduleForm.enabled) return "scheduled";
    return "draft";
  }, [agent?.scheduling_status, scheduleForm.enabled]);

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

    if (
      isLast &&
      scheduleForm.enabled &&
      agent?.scheduling_status !== "scheduled" &&
      agent?.scheduling_status !== "processing"
    ) {
      const parsed = parseScheduleForm(scheduleForm);
      if (!parsed.ok) {
        toast.error(parsed.error);
        return;
      }
      if (!isSurveyReadyToSchedule(config)) {
        toast.error(
          "Add questions and upload a contact file before scheduling"
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      const needsCreate = !surveyId;
      if (needsCreate && !canCreateSurvey) {
        toast.error("You do not have permission to create surveys");
        return;
      }
      if (!needsCreate && !canUpdateSurvey) {
        toast.error("You do not have permission to update surveys");
        return;
      }

      const requiredKeys = TAB_REQUIRED_KEYS[activeTab] ?? [];
      const blockedKey = requiredKeys.find((key) => !computedProgress[key].complete);
      if (blockedKey) {
        toast.error(
          `Complete required fields in ${STEP_LABELS[blockedKey]} before continuing`
        );
        return;
      }

      const alreadyScheduled =
        agent?.scheduling_status === "scheduled" ||
        agent?.scheduling_status === "processing";

      let schedulePayload: Parameters<typeof surveysModuleService.save>[1] = null;
      if (isLast && !alreadyScheduled) {
        const parsed = parseScheduleForm(scheduleForm);
        if (!parsed.ok) {
          toast.error(parsed.error);
          return;
        }
        schedulePayload = parsed.payload;
      }

      const saved = await surveysModuleService.save(
        {
          id: surveyId,
          config,
          step: Math.max(tabIndex, 0) + 1,
        },
        schedulePayload
      );

      if (!surveyId) {
        setSurveyId(saved.id);
      }

      if (isLast) {
        toast.success(
          schedulePayload?.enabled
            ? `"${saved.name}" updated and scheduled`
            : computedProgress.overallComplete
              ? `"${saved.name}" saved as complete draft`
              : `"${saved.name}" saved as draft`
        );
        router.push("/survey");
        return;
      }

      setActiveTab(ENABLED_TAB_ORDER[tabIndex + 1]);
      toast.success(
        computedProgress.overallComplete
          ? "Saved — draft is complete"
          : "Saved as draft — moving to next step"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save survey"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (tab: AgentConfigTab) => {
    if (isAgentConfigTabDisabled(tab)) return;
    const targetIndex = ENABLED_TAB_ORDER.indexOf(tab);
    const canOpen = ENABLED_TAB_ORDER.slice(0, targetIndex).every((stepTab) => {
      const requirementKey = TAB_TO_PROGRESS_KEY[stepTab];
      if (!requirementKey) return true;
      const step = computedProgress[requirementKey];
      return step.optional || step.complete;
    });
    if (!canOpen) {
      toast.error("Complete previous required steps first");
      return;
    }
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
            surveyId={surveyId}
            values={config.surveyQuestions}
            onChange={(v) => updateConfig("surveyQuestions", v)}
          />
        );
      case "farewell":
        return (
          <FarewellTab
            value={config.prompts.farewell ?? ""}
            onChange={(farewell) =>
              updateConfig("prompts", { ...config.prompts, farewell })
            }
          />
        );
      case "client-contact":
        return (
          <ClientContactTab
            surveyId={surveyId}
            values={config.clientContact}
            onChange={(v) => updateConfig("clientContact", v)}
          />
        );
      case "schedule":
        return (
          <ScheduleTab
            values={scheduleForm}
            onChange={setScheduleForm}
            mode={isNew ? "create" : "edit"}
            readOnly={
              agent?.scheduling_status === "scheduled" ||
              agent?.scheduling_status === "processing"
            }
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
            status={displayStatus}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden xl:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
            <aside className="w-full shrink-0 rounded-[6px] border border-border/60 bg-card/70 p-3 shadow-card backdrop-blur-sm lg:w-[220px] lg:overflow-y-auto">
              <SurveyConfigTabs
                active={activeTab}
                onChange={handleTabChange}
                showUpcoming={isNew}
                completedTabs={{
                  persona: computedProgress.identity.complete,
                  prompts: computedProgress.prompts.complete,
                  "survey-questions":
                    computedProgress["survey-questions"].complete,
                  farewell: computedProgress.farewell.complete,
                  "client-contact":
                    computedProgress["client-contact"].complete,
                  schedule: computedProgress.schedule.complete,
                }}
              />
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
                  scheduleEnabled={scheduleForm.enabled}
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
