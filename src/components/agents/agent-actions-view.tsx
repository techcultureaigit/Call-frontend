"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Plus, Zap } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { usePageMeta } from "@/hooks";
import {
  AGENT_ACTION_TABS,
  createAgentActionField,
  HTTP_METHODS,
} from "@/lib/constants/agent-actions";
import { cn } from "@/lib/utils";
import type {
  AgentAction,
  AgentActionField,
  AgentActionTab,
  CustomApiActionFormValues,
  McpActionFormValues,
} from "@/types/agent-action";
import { AgentActionFieldRow } from "./agent-action-field-row";
import { SavedActionsPanel } from "./saved-actions-panel";

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

export function AgentActionsView() {
  const [activeTab, setActiveTab] = useState<AgentActionTab>("mcp");
  const [savedActions, setSavedActions] = useState<AgentAction[]>([]);
  const [mcpForm, setMcpForm] = useState<McpActionFormValues>(INITIAL_MCP);
  const [customForm, setCustomForm] =
    useState<CustomApiActionFormValues>(INITIAL_CUSTOM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Agent Actions",
    breadcrumbs: [
      { label: "Agents", href: "/agents" },
      { label: "Actions" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

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
    <div className="bg-linear-to-b from-brand/5 to-transparent">
      <PageContainer size="full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Agent Actions Management
            </h1>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:bg-card"
              aria-label="Help"
            >
              <HelpCircle className="size-4" />
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card">
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
                            layoutId="action-tab-indicator"
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
                    <McpActionForm
                      values={mcpForm}
                      onChange={setMcpForm}
                      onSubmit={handleCreateMcp}
                      isSubmitting={isSubmitting}
                    />
                  ) : (
                    <CustomApiActionForm
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
              <SavedActionsPanel
                actions={savedActions}
                onDelete={handleDeleteAction}
              />
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  );
}

function McpActionForm({
  values,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  values: McpActionFormValues;
  onChange: (values: McpActionFormValues) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="mcp-name">
          Action Name<span className="text-red-500">*</span>
        </Label>
        <Input
          id="mcp-name"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          placeholder="Enter Action Name"
          className="h-10 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mcp-url">
          MCP Server URL<span className="text-red-500">*</span>
        </Label>
        <Input
          id="mcp-url"
          value={values.mcpServerUrl}
          onChange={(e) =>
            onChange({ ...values, mcpServerUrl: e.target.value })
          }
          placeholder="https://your-mcp-server.com/api"
          className="h-10 rounded-xl"
        />
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          You can set up Zapier MCP Server on this link:{" "}
          <a
            href="https://mcp.zapier.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            https://mcp.zapier.com/
          </a>
        </p>
        <p>
          If you face any issues, feel free to contact us at{" "}
          <a
            href="mailto:hello@vozzo.ai"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            hello@vozzo.ai
          </a>
        </p>
      </div>

      <div className="flex justify-end border-t border-border/40 pt-5">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl px-6"
        >
          <Zap className="size-4" />
          Create Action
        </Button>
      </div>
    </form>
  );
}

function CustomApiActionForm({
  values,
  onChange,
  onUpdateFieldList,
  onRemoveField,
  onSubmit,
  isSubmitting,
}: {
  values: CustomApiActionFormValues;
  onChange: (values: CustomApiActionFormValues) => void;
  onUpdateFieldList: (
    list: "headers" | "parameters",
    updater: (fields: AgentActionField[]) => AgentActionField[]
  ) => void;
  onRemoveField: (list: "headers" | "parameters", id: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="api-name">
          Action Name<span className="text-red-500">*</span>
        </Label>
        <Input
          id="api-name"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          placeholder="Enter Action Name"
          className="h-10 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-description">API Description</Label>
        <Input
          id="api-description"
          value={values.description}
          onChange={(e) =>
            onChange({ ...values, description: e.target.value })
          }
          placeholder="Brief description of the API"
          className="h-10 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-endpoint">
          API End Point<span className="text-red-500">*</span>
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="api-endpoint"
            value={values.endpoint}
            onChange={(e) =>
              onChange({ ...values, endpoint: e.target.value })
            }
            placeholder="https://your-api.com/endpoint"
            className="h-10 flex-1 rounded-xl"
          />
          <Select
            value={values.method}
            onChange={(e) =>
              onChange({
                ...values,
                method: e.target.value as CustomApiActionFormValues["method"],
              })
            }
            options={HTTP_METHODS}
            className="h-10 w-full rounded-xl sm:w-28"
          />
        </div>
      </div>

      <FieldSection
        title="Headers"
        keyLabel="Key"
        fields={values.headers}
        onAdd={() =>
          onUpdateFieldList("headers", (fields) => [
            ...fields,
            createAgentActionField(),
          ])
        }
        onChange={(id, field) =>
          onUpdateFieldList("headers", (fields) =>
            fields.map((f) => (f.id === id ? field : f))
          )
        }
        onRemove={(id) => onRemoveField("headers", id)}
      />

      <FieldSection
        title="Parameters"
        keyLabel="Name"
        fields={values.parameters}
        onAdd={() =>
          onUpdateFieldList("parameters", (fields) => [
            ...fields,
            createAgentActionField(),
          ])
        }
        onChange={(id, field) =>
          onUpdateFieldList("parameters", (fields) =>
            fields.map((f) => (f.id === id ? field : f))
          )
        }
        onRemove={(id) => onRemoveField("parameters", id)}
      />

      <div className="flex justify-end border-t border-border/40 pt-5">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl px-6"
        >
          <Zap className="size-4" />
          Create Action
        </Button>
      </div>
    </form>
  );
}

function FieldSection({
  title,
  keyLabel,
  fields,
  onAdd,
  onChange,
  onRemove,
}: {
  title: string;
  keyLabel: string;
  fields: AgentActionField[];
  onAdd: () => void;
  onChange: (id: string, field: AgentActionField) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground dark:text-foreground">
        {title}
      </h3>

      <div className="hidden grid-cols-12 gap-3 px-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:grid">
        <div className="col-span-3">{keyLabel}</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-4">Description/Value</div>
        <div className="col-span-2 text-center">AI Field</div>
        <div className="col-span-1 text-center">Actions</div>
      </div>

      <div className="space-y-2">
        {fields.map((field) => (
          <AgentActionFieldRow
            key={field.id}
            field={field}
            keyLabel={keyLabel}
            onChange={(updated) => onChange(field.id, updated)}
            onRemove={() => onRemove(field.id)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl border-primary/30 text-primary hover:bg-primary/5"
        onClick={onAdd}
      >
        <Plus className="size-4" /> Add {title === "Headers" ? "Header" : "Parameter"}
      </Button>
    </div>
  );
}
