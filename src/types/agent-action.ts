export type AgentActionTab = "mcp" | "custom-api";

export type AgentActionFieldType = "string" | "number" | "boolean";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface AgentActionField {
  id: string;
  key: string;
  type: AgentActionFieldType;
  value: string;
  aiField: boolean;
}

export interface AgentActionMcp {
  id: string;
  type: "mcp";
  name: string;
  mcpServerUrl: string;
  createdAt: string;
}

export interface AgentActionCustomApi {
  id: string;
  type: "custom-api";
  name: string;
  description: string;
  endpoint: string;
  method: HttpMethod;
  headers: AgentActionField[];
  parameters: AgentActionField[];
  createdAt: string;
}

export type AgentAction = AgentActionMcp | AgentActionCustomApi;

export interface McpActionFormValues {
  name: string;
  mcpServerUrl: string;
}

export interface CustomApiActionFormValues {
  name: string;
  description: string;
  endpoint: string;
  method: HttpMethod;
  headers: AgentActionField[];
  parameters: AgentActionField[];
}
