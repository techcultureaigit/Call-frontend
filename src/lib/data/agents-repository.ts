import type { Agent, AgentConfig, AgentSchedule } from "@/types/agent";
import { storageKeys } from "@/lib/constants/storage-keys";
import {
  filterAgents,
  generateAgentId,
  MOCK_AGENTS,
} from "@/lib/data/mock-agents";
import {
  DEFAULT_AGENT_SCHEDULE,
  isSurveyReadyToSchedule,
} from "@/lib/utils/survey-readiness";

const SEED_IDS = new Set(MOCK_AGENTS.map((a) => a.id));

/** Demo clones — in-memory only until real API; gone on refresh */
const sessionCloneIds = new Set<string>();

let agentsDB: Agent[] = [...MOCK_AGENTS];
let hydrated = false;

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function isCopyName(name: string): boolean {
  return /\(Copy(?:\s+\d+)?\)\s*$/i.test(name.trim());
}

function readCreated(): Agent[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(storageKeys.surveyAgents);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Agent[];
    if (!Array.isArray(parsed)) return [];
    // Drop old demo copies so refresh stays clean
    return parsed.filter((a) => a?.id && !isCopyName(a.name ?? ""));
  } catch {
    return [];
  }
}

/** Persist only real Create/Edit surveys — not demo clones (API will own this later) */
function writeCreated(agents: Agent[]) {
  if (!canUseStorage()) return;
  const created = agents.filter(
    (a) =>
      !SEED_IDS.has(a.id) &&
      !sessionCloneIds.has(a.id) &&
      !isCopyName(a.name)
  );
  window.localStorage.setItem(
    storageKeys.surveyAgents,
    JSON.stringify(created)
  );
}

function hydrate() {
  if (hydrated || !canUseStorage()) return;
  hydrated = true;
  const created = readCreated();
  // Rewrite storage without stale copies
  window.localStorage.setItem(
    storageKeys.surveyAgents,
    JSON.stringify(created)
  );
  if (created.length === 0) return;
  const byId = new Map(agentsDB.map((a) => [a.id, a]));
  for (const agent of created) {
    byId.set(agent.id, agent);
  }
  agentsDB = Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function listAgents(search = ""): Agent[] {
  hydrate();
  return filterAgents(agentsDB, search);
}

export function getAgentById(id: string): Agent | undefined {
  hydrate();
  return agentsDB.find((a) => a.id === id);
}

export interface SaveAgentInput {
  id?: string;
  config: AgentConfig;
  status?: Agent["status"];
}

export function saveAgent(input: SaveAgentInput): Agent {
  hydrate();
  const now = new Date().toISOString();
  const name = input.config.persona.name.trim() || "Untitled Survey";
  const existing = input.id
    ? agentsDB.find((a) => a.id === input.id)
    : undefined;

  if (existing) {
    const updated: Agent = {
      ...existing,
      name,
      status: input.status ?? existing.status,
      language: input.config.persona.language,
      modelMode: input.config.persona.modelMode,
      config: structuredClone(input.config),
      updatedAt: now,
    };
    agentsDB = agentsDB.map((a) => (a.id === existing.id ? updated : a));
    sessionCloneIds.delete(existing.id);
    writeCreated(agentsDB);
    return updated;
  }

  const created: Agent = {
    id: generateAgentId(),
    name,
    status: input.status ?? "active",
    language: input.config.persona.language,
    modelMode: input.config.persona.modelMode,
    phone: null,
    conversationCount: 0,
    config: structuredClone(input.config),
    schedule: { ...DEFAULT_AGENT_SCHEDULE },
    createdAt: now,
    updatedAt: now,
  };

  agentsDB = [created, ...agentsDB];
  writeCreated(agentsDB);
  return created;
}

export function deleteAgent(id: string): boolean {
  hydrate();
  const before = agentsDB.length;
  agentsDB = agentsDB.filter((a) => a.id !== id);
  sessionCloneIds.delete(id);
  if (agentsDB.length === before) return false;
  writeCreated(agentsDB);
  return true;
}

/**
 * Demo: clone full survey in-memory only (refresh clears it).
 * When API is wired, this will POST to create a real duplicate.
 */
export function cloneAgent(id: string): Agent | null {
  hydrate();
  const source = agentsDB.find((a) => a.id === id);
  if (!source) return null;

  const now = new Date().toISOString();
  const config = structuredClone(source.config);
  const baseName = source.name
    .replace(/\s*\(Copy(?:\s+\d+)?\)\s*$/i, "")
    .trim();
  const copyName = `${baseName} (Copy)`;
  config.persona = { ...config.persona, name: copyName };

  const cloned: Agent = {
    id: generateAgentId(),
    name: copyName,
    status: source.status,
    language: source.language,
    modelMode: source.modelMode,
    phone: source.phone ?? null,
    conversationCount: 0,
    config,
    schedule: { ...DEFAULT_AGENT_SCHEDULE },
    createdAt: now,
    updatedAt: now,
  };

  sessionCloneIds.add(cloned.id);
  agentsDB = [cloned, ...agentsDB];
  // Do not persist — demo only until API
  return cloned;
}

export interface ScheduleAgentInput {
  startAt: string;
  endAt?: string | null;
  timezone?: string;
  recurrence?: AgentSchedule["recurrence"];
}

/** Schedule or re-schedule a survey that has all enabled steps filled */
export function scheduleAgent(
  id: string,
  input: ScheduleAgentInput
): Agent | null {
  hydrate();
  const existing = agentsDB.find((a) => a.id === id);
  if (!existing) return null;

  if (!isSurveyReadyToSchedule(existing)) {
    throw new Error(
      "Complete all survey steps (Identity, Instructions, Questions, Contact) before scheduling"
    );
  }

  const now = new Date().toISOString();
  const updated: Agent = {
    ...existing,
    status: "active",
    schedule: {
      enabled: true,
      startAt: input.startAt,
      endAt: input.endAt ?? null,
      timezone: input.timezone || "Asia/Kolkata",
      recurrence: input.recurrence || "once",
      status: "scheduled",
      lastScheduledAt: now,
    },
    updatedAt: now,
  };

  agentsDB = agentsDB.map((a) => (a.id === id ? updated : a));
  writeCreated(agentsDB);
  return updated;
}
