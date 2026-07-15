export type AgentTemplateIndustry =
  | "edtech"
  | "ecommerce"
  | "government"
  | "healthcare"
  | "banking"
  | "sales"
  | "support"
  | "hr";

export interface AgentTemplate {
  id: string;
  name: string;
  industry: AgentTemplateIndustry;
  industryLabel: string;
  description: string;
  tone: string;
  useCase: string;
  icon: string;
  gradient: string;
  accent: string;
  estimatedSetupMinutes: number;
  languages: string[];
  features: string[];
}
