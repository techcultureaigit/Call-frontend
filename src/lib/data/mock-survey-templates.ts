import type { SurveyTemplate } from "@/types/survey-template";

export const SURVEY_TEMPLATE_INDUSTRIES = [
  { value: "all", label: "All Industries" },
  { value: "edtech", label: "Edtech" },
  { value: "ecommerce", label: "Ecommerce" },
  { value: "government", label: "Government Industry" },
  { value: "healthcare", label: "Healthcare" },
  { value: "banking", label: "Banking" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "hr", label: "HR & Recruitment" },
];

export const INDUSTRY_GRADIENTS: Record<
  string,
  { gradient: string; accent: string }
> = {
  edtech: {
    gradient: "from-blue-500/20 via-indigo-500/10 to-violet-500/5",
    accent: "#3b82f6",
  },
  ecommerce: {
    gradient: "from-emerald-500/20 via-teal-500/10 to-green-500/5",
    accent: "#10b981",
  },
  government: {
    gradient: "from-slate-500/20 via-zinc-500/10 to-stone-500/5",
    accent: "#64748b",
  },
  healthcare: {
    gradient: "from-rose-500/20 via-pink-500/10 to-red-500/5",
    accent: "#f43f5e",
  },
  banking: {
    gradient: "from-amber-500/20 via-orange-500/10 to-yellow-500/5",
    accent: "#f59e0b",
  },
  sales: {
    gradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/5",
    accent: "#8b5cf6",
  },
  support: {
    gradient: "from-cyan-500/20 via-sky-500/10 to-blue-500/5",
    accent: "#06b6d4",
  },
  hr: {
    gradient: "from-fuchsia-500/20 via-pink-500/10 to-rose-500/5",
    accent: "#d946ef",
  },
};

/** Sample survey templates (list page) */
export const MOCK_SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: "tpl_academic_advising",
    name: "Academic Advising",
    industry: "edtech",
    industryLabel: "Edtech",
    description:
      "Guide students through course selection, degree requirements, and academic planning with a warm, knowledgeable voice agent.",
    tone: "Warm, empathetic, and patient",
    useCase: "Student course advising and academic planning",
    greeting:
      "Hello! I'm your Academic Advising assistant. How can I help you today?",
    icon: "graduation",
    ...INDUSTRY_GRADIENTS.edtech,
    estimatedSetupMinutes: 8,
    languages: ["English", "Hindi"],
    features: ["Course lookup", "Schedule conflict check", "Degree progress"],
  },
  {
    id: "tpl_order_tracking",
    name: "Order Tracking",
    industry: "ecommerce",
    industryLabel: "Ecommerce",
    description:
      "Provide real-time order status, shipping updates, and delivery estimates with a helpful, efficient voice.",
    tone: "Helpful and efficient",
    useCase: "Post-purchase order status inquiries",
    greeting:
      "Hello! I'm your Order Tracking assistant. How can I help you today?",
    icon: "package",
    ...INDUSTRY_GRADIENTS.ecommerce,
    estimatedSetupMinutes: 7,
    languages: ["English", "Hindi"],
    features: ["Order lookup", "Shipping status", "Return initiation"],
  },
];

export function buildSystemPromptFromTemplate(template: SurveyTemplate): string {
  return `${template.description}\n\nTone: ${template.tone}\nUse case: ${template.useCase}`;
}
