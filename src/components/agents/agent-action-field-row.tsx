"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FIELD_TYPES } from "@/lib/constants/agent-actions";
import type { AgentActionField } from "@/types/agent-action";

interface AgentActionFieldRowProps {
  field: AgentActionField;
  keyLabel: string;
  valuePlaceholder?: string;
  onChange: (field: AgentActionField) => void;
  onRemove: () => void;
}

export function AgentActionFieldRow({
  field,
  keyLabel,
  valuePlaceholder = "Fixed value",
  onChange,
  onRemove,
}: AgentActionFieldRowProps) {
  return (
    <div className="grid grid-cols-12 items-center gap-2 rounded-[6px] border border-border/40 bg-muted/20 p-2 sm:gap-3 sm:p-3">
      <div className="col-span-12 sm:col-span-3">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">
          {keyLabel}
        </p>
        <Input
          value={field.key}
          onChange={(e) => onChange({ ...field, key: e.target.value })}
          placeholder={
            keyLabel === "Key" ? "e.g. Authorization" : "e.g. loanRequestId"
          }
          className="h-9 rounded-lg bg-background"
        />
      </div>

      <div className="col-span-6 sm:col-span-2">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">
          Type
        </p>
        <Select
          value={field.type}
          onChange={(e) =>
            onChange({
              ...field,
              type: e.target.value as AgentActionField["type"],
            })
          }
          options={FIELD_TYPES}
          className="h-9 rounded-lg"
        />
      </div>

      <div className="col-span-6 sm:col-span-4">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">
          Description/Value
        </p>
        <Input
          value={field.value}
          onChange={(e) => onChange({ ...field, value: e.target.value })}
          placeholder={valuePlaceholder}
          className="h-9 rounded-lg bg-background"
        />
      </div>

      <div className="col-span-6 flex items-center justify-center gap-2 sm:col-span-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">
          AI Field
        </p>
        <Switch
          checked={field.aiField}
          onCheckedChange={(aiField) => onChange({ ...field, aiField })}
        />
      </div>

      <div className="col-span-6 flex justify-end sm:col-span-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg text-red-600 hover:bg-red-500/10 hover:text-red-700"
          onClick={onRemove}
          aria-label="Remove row"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
