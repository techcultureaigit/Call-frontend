import type { AgentTemplate } from "@/types/agent-template";

export const AGENT_TEMPLATE_INDUSTRIES = [
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

export const INDUSTRY_GRADIENTS: Record<string, { gradient: string; accent: string }> = {
  edtech: { gradient: "from-blue-500/20 via-indigo-500/10 to-violet-500/5", accent: "#3b82f6" },
  ecommerce: { gradient: "from-emerald-500/20 via-teal-500/10 to-green-500/5", accent: "#10b981" },
  government: { gradient: "from-slate-500/20 via-zinc-500/10 to-stone-500/5", accent: "#64748b" },
  healthcare: { gradient: "from-rose-500/20 via-pink-500/10 to-red-500/5", accent: "#f43f5e" },
  banking: { gradient: "from-amber-500/20 via-orange-500/10 to-yellow-500/5", accent: "#f59e0b" },
  sales: { gradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/5", accent: "#8b5cf6" },
  support: { gradient: "from-cyan-500/20 via-sky-500/10 to-blue-500/5", accent: "#06b6d4" },
  hr: { gradient: "from-fuchsia-500/20 via-pink-500/10 to-rose-500/5", accent: "#d946ef" },
};

export const MOCK_AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "tpl_academic_advising",
    name: "Academic Advising",
    industry: "edtech",
    industryLabel: "Edtech",
    description:
      "Guide students through course selection, degree requirements, and academic planning with a warm, knowledgeable voice agent.",
    tone: "Warm, empathetic, and patient",
    useCase: "Student course advising and academic planning",
    icon: "graduation",
    ...INDUSTRY_GRADIENTS.edtech,
    estimatedSetupMinutes: 8,
    languages: ["English", "Hindi"],
    features: ["Course lookup", "Schedule conflict check", "Degree progress"],
  },
  {
    id: "tpl_ai_tutoring",
    name: "AI Tutoring & Support",
    industry: "edtech",
    industryLabel: "Edtech",
    description:
      "Provide personalized tutoring assistance, answer subject questions, and offer study resources in a supportive tone.",
    tone: "Encouraging, clear, and educational",
    useCase: "After-hours tutoring and homework support",
    icon: "book",
    ...INDUSTRY_GRADIENTS.edtech,
    estimatedSetupMinutes: 10,
    languages: ["English"],
    features: ["Subject Q&A", "Study tips", "Resource links"],
  },
  {
    id: "tpl_campus_info",
    name: "Campus Information",
    industry: "edtech",
    industryLabel: "Edtech",
    description:
      "Answer campus FAQs — facilities, events, dining hours, and navigation — with a friendly, informative voice.",
    tone: "Friendly and informative",
    useCase: "Campus visitor and student information desk",
    icon: "building",
    ...INDUSTRY_GRADIENTS.edtech,
    estimatedSetupMinutes: 6,
    languages: ["English", "Spanish"],
    features: ["Campus map", "Event calendar", "Facility hours"],
  },
  {
    id: "tpl_student_enrollment",
    name: "Student Enrollment Support",
    industry: "edtech",
    industryLabel: "Edtech",
    description:
      "Assist prospective and returning students with enrollment steps, document requirements, and deadline reminders.",
    tone: "Professional and reassuring",
    useCase: "Enrollment season support calls",
    icon: "users",
    ...INDUSTRY_GRADIENTS.edtech,
    estimatedSetupMinutes: 12,
    languages: ["English", "Hindi", "French"],
    features: ["Document checklist", "Deadline alerts", "Status tracking"],
  },
  {
    id: "tpl_service_tracking",
    name: "Service Professional Tracking",
    industry: "ecommerce",
    industryLabel: "Ecommerce",
    description:
      "Keep customers informed about service technician arrival times, job status, and rescheduling options.",
    tone: "Professional and proactive",
    useCase: "Field service and appointment tracking",
    icon: "truck",
    ...INDUSTRY_GRADIENTS.ecommerce,
    estimatedSetupMinutes: 9,
    languages: ["English"],
    features: ["ETA updates", "Reschedule flow", "Technician info"],
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
    icon: "package",
    ...INDUSTRY_GRADIENTS.ecommerce,
    estimatedSetupMinutes: 7,
    languages: ["English", "Hindi"],
    features: ["Order lookup", "Shipping status", "Return initiation"],
  },
  {
    id: "tpl_candidate_screening",
    name: "Candidate Screening",
    industry: "government",
    industryLabel: "Government Industry",
    description:
      "Conduct structured pre-screening interviews for government positions with compliance-ready conversation flows.",
    tone: "Formal, fair, and structured",
    useCase: "Public sector recruitment screening",
    icon: "shield",
    ...INDUSTRY_GRADIENTS.government,
    estimatedSetupMinutes: 15,
    languages: ["English", "Hindi"],
    features: ["Bilingual support", "Compliance logging", "Score rubric"],
  },
  {
    id: "tpl_grievance_desk",
    name: "Grievance Help Desk",
    industry: "government",
    industryLabel: "Government Industry",
    description:
      "Receive citizen grievances, categorize issues, and provide ticket references with an empathetic, official tone.",
    tone: "Empathetic and official",
    useCase: "Citizen complaint and grievance intake",
    icon: "message",
    ...INDUSTRY_GRADIENTS.government,
    estimatedSetupMinutes: 11,
    languages: ["English", "Hindi", "Regional"],
    features: ["Ticket creation", "Category routing", "SLA tracking"],
  },
  {
    id: "tpl_patient_scheduling",
    name: "Patient Appointment Scheduling",
    industry: "healthcare",
    industryLabel: "Healthcare",
    description:
      "Schedule, reschedule, and confirm patient appointments with HIPAA-aware conversation handling.",
    tone: "Calm, caring, and precise",
    useCase: "Clinic and hospital scheduling",
    icon: "heart",
    ...INDUSTRY_GRADIENTS.healthcare,
    estimatedSetupMinutes: 10,
    languages: ["English", "Spanish"],
    features: ["Calendar sync", "Reminder calls", "Insurance verify"],
  },
  {
    id: "tpl_loan_assistant",
    name: "Loan Application Assistant",
    industry: "banking",
    industryLabel: "Banking",
    description:
      "Guide applicants through loan pre-qualification, document collection, and application status updates.",
    tone: "Trustworthy and consultative",
    useCase: "Retail banking loan intake",
    icon: "credit",
    ...INDUSTRY_GRADIENTS.banking,
    estimatedSetupMinutes: 14,
    languages: ["English", "Hindi"],
    features: ["Pre-qualification", "Doc upload guide", "Rate inquiry"],
  },
  {
    id: "tpl_sales_outreach",
    name: "Outbound Sales Qualifier",
    industry: "sales",
    industryLabel: "Sales",
    description:
      "Qualify inbound leads with BANT framework, score intent, and route hot prospects to sales reps.",
    tone: "Energetic and persuasive",
    useCase: "B2B lead qualification calls",
    icon: "target",
    ...INDUSTRY_GRADIENTS.sales,
    estimatedSetupMinutes: 8,
    languages: ["English"],
    features: ["Lead scoring", "CRM sync", "Meeting booking"],
  },
  {
    id: "tpl_tech_support",
    name: "Technical Support Agent",
    industry: "support",
    industryLabel: "Support",
    description:
      "Troubleshoot common technical issues, escalate complex cases, and collect diagnostic information.",
    tone: "Patient and technical",
    useCase: "Tier-1 technical support automation",
    icon: "headset",
    ...INDUSTRY_GRADIENTS.support,
    estimatedSetupMinutes: 12,
    languages: ["English", "Hindi"],
    features: ["Diagnostic flow", "Escalation rules", "Knowledge base"],
  },
];

export function filterAgentTemplates(
  templates: AgentTemplate[],
  search: string,
  industry: string
): AgentTemplate[] {
  let result = [...templates];

  if (industry && industry !== "all") {
    result = result.filter((t) => t.industry === industry);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.industryLabel.toLowerCase().includes(q) ||
        t.useCase.toLowerCase().includes(q)
    );
  }

  return result;
}
