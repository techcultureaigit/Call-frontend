"use client";

/**
 * survey-actions-manager.tsx
 * Full actions UI — MCP + Custom API tabs, forms, saved list.
 * Route: /survey/actions
 * No API calls — mock UI only.
 */

import { cn } from "@/lib/utils";
import type {
  AgentAction,
  AgentActionField,
  AgentActionTab,
  CustomApiActionFormValues,
  McpActionFormValues,
} from "@/types/agent-action";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AGENT_ACTION_TABS,
  createAgentActionField,
} from "./survey-action-constants";
import { AgentCustomApiActionForm } from "./survey-custom-api-action-form";
import { AgentMcpActionForm } from "./survey-mcp-action-form";
import { AgentSavedActionsPanel } from "./survey-saved-actions-panel";

const INITIAL_MCP: McpActionFormValues = {
  name: "",
  mcpServerUrl: "",
};

const INITIAL_CUSTOM: CustomApiActionFormValues = {
  name: "",
  description: "",
  endpoint: "",
  method: "POST",
  headers: [createAgentActionField()],
  parameters: [createAgentActionField()],
};

export interface AgentActionsManagerProps {
  title?: string;
  showHelpButton?: boolean;
  className?: string;
}

export function AgentActionsManager({
  title = "Actions Management",
  showHelpButton = true,
  className,
}: AgentActionsManagerProps) {
  const [activeTab, setActiveTab] = useState<AgentActionTab>("mcp");
  const [savedActions, setSavedActions] = useState<AgentAction[]>([]);
  const [mcpForm, setMcpForm] = useState<McpActionFormValues>(INITIAL_MCP);
  const [customForm, setCustomForm] =
    useState<CustomApiActionFormValues>(INITIAL_CUSTOM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFieldList = (
    list: "headers" | "parameters",
    updater: (fields: AgentActionField[]) => AgentActionField[]
  ) => {
    setCustomForm((prev) => ({
      ...prev,
      [list]: updater(prev[list]),
    }));
  };

  const handleRemoveField = (
    list: "headers" | "parameters",
    id: string
  ) => {
    updateFieldList(list, (fields) => {
      const next = fields.filter((f) => f.id !== id);
      return next.length > 0 ? next : [createAgentActionField()];
    });
  };

  const handleCreateMcp = () => {
    if (!mcpForm.name.trim()) {
      toast.error("Action name is required");
      return;
    }
    if (!mcpForm.mcpServerUrl.trim()) {
      toast.error("MCP Server URL is required");
      return;
    }

    setIsSubmitting(true);
    const action: AgentAction = {
      id: crypto.randomUUID?.() ?? `action-${Date.now()}`,
      type: "mcp",
      name: mcpForm.name.trim(),
      mcpServerUrl: mcpForm.mcpServerUrl.trim(),
      createdAt: new Date().toISOString(),
    };

    setSavedActions((prev) => [action, ...prev]);
    setMcpForm(INITIAL_MCP);
    setIsSubmitting(false);
    toast.success(`"${action.name}" created successfully`);
  };

  const handleCreateCustomApi = () => {
    if (!customForm.name.trim()) {
      toast.error("Action name is required");
      return;
    }
    if (!customForm.endpoint.trim()) {
      toast.error("API endpoint is required");
      return;
    }

    setIsSubmitting(true);
    const action: AgentAction = {
      id: crypto.randomUUID?.() ?? `action-${Date.now()}`,
      type: "custom-api",
      name: customForm.name.trim(),
      description: customForm.description.trim(),
      endpoint: customForm.endpoint.trim(),
      method: customForm.method,
      headers: customForm.headers.filter((h) => h.key.trim()),
      parameters: customForm.parameters.filter((p) => p.key.trim()),
      createdAt: new Date().toISOString(),
    };

    setSavedActions((prev) => [action, ...prev]);
    setCustomForm(INITIAL_CUSTOM);
    setIsSubmitting(false);
    toast.success(`"${action.name}" created successfully`);
  };

  const handleDeleteAction = (id: string) => {
    setSavedActions((prev) => prev.filter((a) => a.id !== id));
    toast.success("Action deleted");
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {showHelpButton && (
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:bg-card"
            aria-label="Help"
          >
            <HelpCircle className="size-4" />
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-[6px] border border-border/40 bg-card shadow-card">
            <div className="flex border-b border-border/40">
              {AGENT_ACTION_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative flex-1 px-4 py-3.5 text-sm font-medium transition-colors sm:px-6",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    {isActive && (
                      <motion.span
                        layoutId="agent-action-tab-indicator"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-5 sm:p-6">
              {activeTab === "mcp" ? (
                <AgentMcpActionForm
                  values={mcpForm}
                  onChange={setMcpForm}
                  onSubmit={handleCreateMcp}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <AgentCustomApiActionForm
                  values={customForm}
                  onChange={setCustomForm}
                  onUpdateFieldList={updateFieldList}
                  onRemoveField={handleRemoveField}
                  onSubmit={handleCreateCustomApi}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <AgentSavedActionsPanel
            actions={savedActions}
            onDelete={handleDeleteAction}
          />
        </div>
      </div>
    </div>
  );
}
