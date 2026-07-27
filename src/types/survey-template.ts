export type SurveyTemplateIndustry =
  | "edtech"
  | "ecommerce"
  | "government"
  | "healthcare"
  | "banking"
  | "sales"
  | "support"
  | "hr";

export interface SurveyTemplate {
  id: string;
  name: string;
  industry: SurveyTemplateIndustry;
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
