import type { AgentActionFieldType, HttpMethod } from "@/types/agent-action";

export const AGENT_ACTION_TABS = [
  { id: "mcp" as const, label: "MCP Server" },
  { id: "custom-api" as const, label: "Custom API" },
];

export const HTTP_METHODS: { label: string; value: HttpMethod }[] = [
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
  { label: "PUT", value: "PUT" },
  { label: "PATCH", value: "PATCH" },
  { label: "DELETE", value: "DELETE" },
];

export const FIELD_TYPES: { label: string; value: AgentActionFieldType }[] = [
  { label: "String", value: "string" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
];

export function createAgentActionField(): {
  id: string;
  key: string;
  type: AgentActionFieldType;
  value: string;
  aiField: boolean;
} {
  return {
    id: crypto.randomUUID?.() ?? `field-${Date.now()}-${Math.random()}`,
    key: "",
    type: "string",
    value: "",
    aiField: false,
  };
}
