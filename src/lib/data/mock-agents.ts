import type { Agent } from "@/types/agent";
import { DEFAULT_AGENT_CONFIG } from "@/lib/constants/agent-config";

function at(iso: string): string {
  return new Date(iso).toISOString();
}

/** Essential sample surveys — mirrors details captured when creating a survey. */
export const MOCK_AGENTS: Agent[] = [
  {
    id: "agent_001",
    name: "Grievance Help Desk",
    scheduling_status: "draft",
    language: "en",
    modelMode: "pipeline",
    phone: null,
    conversationCount: 3,
    config: {
      ...DEFAULT_AGENT_CONFIG,
      persona: {
        ...DEFAULT_AGENT_CONFIG.persona,
        name: "Grievance Help Desk",
        language: "en",
        tts: { provider: "google", model: "Google", voice: "Saras" },
      },
      prompts: {
        ...DEFAULT_AGENT_CONFIG.prompts,
        greeting:
          "Hello! I'm here to help you register and track your grievance. How may I assist you today?",
        systemPrompt:
          "You are a warm, empathetic grievance help desk agent for government services.\n\nTone: Calm and reassuring\nUse case: Citizen grievance intake and ticket status",
      },
      wisdom: {
        ...DEFAULT_AGENT_CONFIG.wisdom,
        topics: ["Citizen grievance intake and ticket status", "Government Industry"],
      },
      surveyQuestions: {
        enabled: true,
        questions: [
          {
            id: "sq_001",
            type: "text",
            question: "Please describe your grievance briefly.",
          },
          {
            id: "sq_002",
            type: "multiple_choice",
            question: "Which department does this concern?",
            options: [
              { id: "o1", label: "Public Works", value: "public_works" },
              { id: "o2", label: "Utilities", value: "utilities" },
              { id: "o3", label: "Other", value: "other" },
            ],
          },
        ],
      },
      clientContact: {
        contactFileUrl: "https://example.com/contacts/grievance-helpdesk.csv",
        contactFileName: "grievance-helpdesk.csv",
        contacts: [
          { contact: "9876543210" },
          { contact: "9123456780" },
        ],
      },
    },
    schedule: {
      enabled: false,
      startAt: null,
      endAt: null,
      timezone: "Asia/Kolkata",
      recurrence: "once",
      status: "idle",
      lastScheduledAt: null,
    },
    createdAt: at("2024-07-12T11:20:08"),
    updatedAt: at("2024-07-13T09:15:44"),
  },
  {
    id: "agent_002",
    name: "Candidate Screening",
    scheduling_status: "draft",
    language: "en",
    modelMode: "pipeline",
    phone: null,
    conversationCount: 1,
    config: {
      ...DEFAULT_AGENT_CONFIG,
      persona: {
        ...DEFAULT_AGENT_CONFIG.persona,
        name: "Candidate Screening",
        language: "en",
        tts: { provider: "google", model: "Google", voice: "Aakash" },
      },
      prompts: {
        ...DEFAULT_AGENT_CONFIG.prompts,
        greeting:
          "Hi! Thank you for your interest. I'd like to ask you a few screening questions.",
        systemPrompt:
          "You are a professional HR screening agent conducting initial candidate evaluations.\n\nTone: Professional and clear\nUse case: Pre-screening interviews for open roles",
      },
      wisdom: {
        ...DEFAULT_AGENT_CONFIG.wisdom,
        topics: ["Pre-screening interviews for open roles", "HR & Recruitment"],
      },
      surveyQuestions: {
        enabled: true,
        questions: [
          {
            id: "sq_101",
            type: "yes_no",
            question: "Are you available to start within 30 days?",
          },
          {
            id: "sq_102",
            type: "rating",
            question: "How many years of relevant experience do you have?",
          },
        ],
      },
      clientContact: {
        contactFileUrl: "https://example.com/contacts/candidate-screening.csv",
        contactFileName: "candidate-screening.csv",
        contacts: [
          { contact: "9988776655" },
          { contact: "9012345678" },
        ],
      },
    },
    schedule: {
      enabled: false,
      startAt: null,
      endAt: null,
      timezone: "Asia/Kolkata",
      recurrence: "once",
      status: "idle",
      lastScheduledAt: null,
    },
    createdAt: at("2024-07-10T08:45:17"),
    updatedAt: at("2024-07-14T14:02:31"),
  },
];

export function filterAgents(agents: Agent[], search: string): Agent[] {
  const q = search.trim().toLowerCase();
  if (!q) return agents;
  return agents.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      a.config.persona.tts.voice?.toLowerCase().includes(q)
  );
}

export function generateAgentId(): string {
  return `agent_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
