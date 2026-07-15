"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { usePageMeta } from "@/hooks";
import { DEFAULT_AGENT_CONFIG } from "@/lib/constants/agent-config";
import { generateAgentUuid } from "@/lib/data/mock-agents";
import { MOCK_AGENT_TEMPLATES } from "@/lib/data/mock-agent-templates";
import { AgentTopNav } from "./agent-top-nav";
import { AgentConfigTabs } from "./agent-config-tabs";
import { AgentConfigSidebar } from "./agent-config-sidebar";
import { AgentConfigFooter } from "./agent-config-footer";
import { PersonaTab } from "./tabs/persona-tab";
import { PromptsTab } from "./tabs/prompts-tab";
import { WisdomTab } from "./tabs/wisdom-tab";
import { FunctionsTab } from "./tabs/functions-tab";
import { PostCallTab } from "./tabs/post-call-tab";
import type { Agent, AgentConfig, AgentConfigTab } from "@/types/agent";

const TAB_ORDER: AgentConfigTab[] = [
  "persona",
  "prompts",
  "wisdom",
  "functions",
  "post-call",
];

interface AgentConfigureViewProps {
  agent?: Agent | null;
  isNew?: boolean;
}

export function AgentConfigureView({
  agent,
  isNew = false,
}: AgentConfigureViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  const [activeTab, setActiveTab] = useState<AgentConfigTab>("persona");
  const [uuid] = useState(agent?.uuid ?? generateAgentUuid());
  const [config, setConfig] = useState<AgentConfig>(
    agent?.config ?? structuredClone(DEFAULT_AGENT_CONFIG)
  );
  const [isSaving, setIsSaving] = useState(false);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: isNew ? "Create Agent" : "Configure Agent",
    breadcrumbs: [
      { label: "Agents", href: "/agents" },
      { label: isNew ? "Create New" : agent?.name ?? "Configure" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta, isNew, agent?.name]);

  useEffect(() => {
    if (!isNew || agent || !templateId) return;
    const template = MOCK_AGENT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setConfig((prev) => ({
      ...prev,
      persona: { ...prev.persona, name: template.name },
      prompts: {
        ...prev.prompts,
        systemPrompt: `${template.description}\n\nTone: ${template.tone}\nUse case: ${template.useCase}`,
        greeting: `Hello! I'm your ${template.name} assistant. How can I help you today?`,
      },
      wisdom: {
        ...prev.wisdom,
        topics: [template.useCase, template.industryLabel],
      },
    }));
    toast.success(`Loaded "${template.name}" template`);
  }, [isNew, agent, templateId]);

  const updateConfig = useCallback(
    <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const tabIndex = TAB_ORDER.indexOf(activeTab);
  const isFirst = tabIndex === 0;
  const isLast = tabIndex === TAB_ORDER.length - 1;

  const handleBack = () => {
    if (!isFirst) setActiveTab(TAB_ORDER[tabIndex - 1]);
  };

  const handleNext = async () => {
    if (!config.persona.name.trim() && activeTab === "persona") {
      toast.error("Please enter an agent name");
      return;
    }

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsSaving(false);

    if (isLast) {
      toast.success("Agent configuration saved");
      router.push("/agents");
      return;
    }

    setActiveTab(TAB_ORDER[tabIndex + 1]);
    toast.success("Saved — moving to next step");
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
    <PageContainer size="full">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <AgentTopNav active="configure" />

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="min-w-0 rounded-2xl border border-border/50 bg-card/80 p-5 shadow-card backdrop-blur-sm sm:p-6 lg:p-8">
            <AgentConfigTabs active={activeTab} onChange={setActiveTab} />

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-6"
            >
              {renderTab()}
            </motion.div>

            <AgentConfigFooter
              onBack={handleBack}
              onNext={handleNext}
              isFirst={isFirst}
              isLast={isLast}
              isSaving={isSaving}
            />
          </div>

          <AgentConfigSidebar
            uuid={uuid}
            agentName={config.persona.name}
          />
        </div>
      </motion.div>
    </PageContainer>
  );
}
