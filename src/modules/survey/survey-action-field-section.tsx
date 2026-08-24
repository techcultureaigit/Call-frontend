"use client";

/**
 * survey-action-field-section.tsx
 * Headers / parameters section with add row button.
 * No API calls.
 */

import { Button } from "@/components/ui/button";
import type { AgentActionField } from "@/types/agent-action";
import { Plus } from "lucide-react";

import { createAgentActionField } from "./survey-action-constants";
import { AgentActionFieldRow } from "./survey-action-field-row";

export interface AgentActionFieldSectionProps {
  title: string;
  keyLabel: string;
  fields: AgentActionField[];
  onAdd: () => void;
  onChange: (id: string, field: AgentActionField) => void;
  onRemove: (id: string) => void;
}

export function AgentActionFieldSection({
  title,
  keyLabel,
  fields,
  onAdd,
  onChange,
  onRemove,
}: AgentActionFieldSectionProps) {
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
        className="rounded-[6px] border-primary/30 text-primary hover:bg-primary/5"
        onClick={onAdd}
      >
        <Plus className="size-4" /> Add{" "}
        {title === "Headers" ? "Header" : "Parameter"}
      </Button>
    </div>
  );
}

export { createAgentActionField };
