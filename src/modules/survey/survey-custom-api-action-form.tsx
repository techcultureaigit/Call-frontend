"use client";

/**
 * survey-custom-api-action-form.tsx
 * Custom API action form — endpoint, method, headers, parameters.
 * No API calls.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type {
  AgentActionField,
  CustomApiActionFormValues,
} from "@/types/agent-action";
import { Zap } from "lucide-react";

import { AGENT_HTTP_METHODS } from "./survey-action-constants";
import {
  AgentActionFieldSection,
  createAgentActionField,
} from "./survey-action-field-section";

export interface AgentCustomApiActionFormProps {
  values: CustomApiActionFormValues;
  onChange: (values: CustomApiActionFormValues) => void;
  onUpdateFieldList: (
    list: "headers" | "parameters",
    updater: (fields: AgentActionField[]) => AgentActionField[]
  ) => void;
  onRemoveField: (list: "headers" | "parameters", id: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function AgentCustomApiActionForm({
  values,
  onChange,
  onUpdateFieldList,
  onRemoveField,
  onSubmit,
  isSubmitting,
}: AgentCustomApiActionFormProps) {
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
          className="h-10 rounded-[6px]"
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
          className="h-10 rounded-[6px]"
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
            className="h-10 flex-1 rounded-[6px]"
          />
          <Select
            value={values.method}
            onChange={(e) =>
              onChange({
                ...values,
                method: e.target.value as CustomApiActionFormValues["method"],
              })
            }
            options={AGENT_HTTP_METHODS}
            className="h-10 w-full rounded-[6px] sm:w-28"
          />
        </div>
      </div>

      <AgentActionFieldSection
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

      <AgentActionFieldSection
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
          className="rounded-[6px] px-6"
        >
          <Zap className="size-4" />
          Create Action
        </Button>
      </div>
    </form>
  );
}
