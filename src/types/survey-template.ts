export type SurveyTemplateIndustry =
  | "edtech"
  | "ecommerce"
  | "government"
  | "healthcare"
  | "banking"
  | "sales"
  | "support"
  | "hr";

/** Fields that seed Create Survey (Identity + Instructions + Knowledge) */
export interface SurveyTemplate {
  id: string;
  /** → persona.name */
  name: string;
  industry: SurveyTemplateIndustry;
  industryLabel: string;
  /** → prompts.systemPrompt intro */
  description: string;
  /** → prompts.systemPrompt tone line */
  tone: string;
  /** → wisdom.topics + systemPrompt use-case line */
  useCase: string;
  /** → prompts.greeting */
  greeting: string;
  icon: string;
  gradient: string;
  accent: string;
  estimatedSetupMinutes: number;
  /** → persona.language options */
  languages: string[];
  features: string[];
}
