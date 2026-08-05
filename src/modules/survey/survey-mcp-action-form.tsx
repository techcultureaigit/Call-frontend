"use client";

/**
 * survey-mcp-action-form.tsx
 * MCP server action form — name + URL inputs.
 * No API calls.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { McpActionFormValues } from "@/types/agent-action";
import { Zap } from "lucide-react";

export interface AgentMcpActionFormProps {
  values: McpActionFormValues;
  onChange: (values: McpActionFormValues) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function AgentMcpActionForm({
  values,
  onChange,
  onSubmit,
  isSubmitting,
}: AgentMcpActionFormProps) {
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
          className="h-10 rounded-[6px]"
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
          className="h-10 rounded-[6px]"
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
            href="mailto:support@callhub.io"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            support@callhub.io
          </a>
        </p>
      </div>

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
