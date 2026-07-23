import type { Agent } from "@/types/agent";
import { DEFAULT_AGENT_CONFIG } from "@/lib/constants/agent-config";

function at(iso: string): string {
  return new Date(iso).toISOString();
}

export const MOCK_AGENTS: Agent[] = [
  {
    id: "agent_001",
    uuid: "9358c6ce-4a2b-4f1d-9e87-2c1a8b3d4e5f",
    name: "wwwf",
    status: "active",
    language: "en",
    modelMode: "pipeline",
    phone: null,
    conversationCount: 0,
    config: {
      ...DEFAULT_AGENT_CONFIG,
      persona: {
        ...DEFAULT_AGENT_CONFIG.persona,
        name: "wwwf",
        tts: { provider: "google", model: "Google", voice: "Aakash" },
      },
    },
    createdAt: at("2024-07-14T15:34:23"),
    updatedAt: at("2024-07-14T15:34:23"),
  },
  {
    id: "agent_002",
    uuid: "a7f3e912-8c45-4d2a-b6f1-9e0d3c7a1b42",
    name: "Grievance Help Desk",
    status: "active",
    language: "zh",
    modelMode: "pipeline",
    phone: null,
    conversationCount: 0,
    config: {
      ...DEFAULT_AGENT_CONFIG,
      persona: {
        ...DEFAULT_AGENT_CONFIG.persona,
        name: "Grievance Help Desk",
        language: "zh",
        tts: { provider: "google", model: "Google", voice: "Saras" },
      },
      prompts: {
        ...DEFAULT_AGENT_CONFIG.prompts,
        greeting:
          "Hello! I'm here to help you register and track your grievance. How may I assist you today?",
        systemPrompt:
          "You are a warm, empathetic grievance help desk agent for government services.",
      },
    },
    createdAt: at("2024-07-12T11:20:08"),
    updatedAt: at("2024-07-13T09:15:44"),
  },
  {
    id: "agent_003",
    uuid: "bf8ee71a-191d-4263-9ff9-18c0fce7159d",
    name: "Candidate Screening",
    status: "active",
    language: "en",
    modelMode: "pipeline",
    phone: null,
    conversationCount: 1,
    config: {
      ...DEFAULT_AGENT_CONFIG,
      persona: {
        ...DEFAULT_AGENT_CONFIG.persona,
        name: "Candidate Screening",
        tts: { provider: "google", model: "Google", voice: "Aakash" },
      },
      prompts: {
        ...DEFAULT_AGENT_CONFIG.prompts,
        greeting:
          "Hi! Thank you for your interest. I'd like to ask you a few screening questions.",
        systemPrompt:
          "You are a professional HR screening agent conducting initial candidate evaluations.",
      },
    },
    createdAt: at("2024-07-10T08:45:17"),
    updatedAt: at("2024-07-14T14:02:31"),
  },
];

export function getAgentById(id: string): Agent | undefined {
  return MOCK_AGENTS.find((a) => a.id === id);
}

export function filterAgents(agents: Agent[], search: string): Agent[] {
  const q = search.trim().toLowerCase();
  if (!q) return agents;
  return agents.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.uuid.toLowerCase().includes(q) ||
      a.config.persona.tts.voice?.toLowerCase().includes(q)
  );
}

export function generateAgentUuid(): string {
  return crypto.randomUUID?.() ?? `agent-${Date.now()}`;
}
