import type {
  CampaignTemplate,
  CreateTemplatePayload,
  TemplateCategory,
  TemplateLanguage,
  TemplateStats,
  TemplateStatus,
  TemplatesQueryParams,
} from "@/types/campaign-template";
import { MOCK_CAMPAIGN_TEMPLATES } from "@/lib/data/mock-campaign-templates";

let templatesDB: CampaignTemplate[] = [...MOCK_CAMPAIGN_TEMPLATES];

export function queryTemplates(
  params: TemplatesQueryParams = {}
): CampaignTemplate[] {
  const {
    search = "",
    category = "all",
    status = "all",
    language = "all",
    aiOnly = false,
  } = params;

  let filtered = [...templatesDB];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.surveyName.toLowerCase().includes(q)
    );
  }

  if (category !== "all") {
    filtered = filtered.filter((t) => t.category === category);
  }
  if (status !== "all") {
    filtered = filtered.filter((t) => t.status === status);
  }
  if (language !== "all") {
    filtered = filtered.filter(
      (t) => t.language === language || t.languages.includes(language)
    );
  }
  if (aiOnly) {
    filtered = filtered.filter((t) => t.isAiPowered);
  }

  return filtered.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getTemplateById(id: string): CampaignTemplate | undefined {
  return templatesDB.find((t) => t.id === id);
}

export function getTemplateStats(): TemplateStats {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const categories: TemplateCategory[] = [
    "sales",
    "banking",
    "insurance",
    "healthcare",
    "customer_feedback",
    "lead_qualification",
    "collections",
    "custom",
  ];
  const byCategory = Object.fromEntries(
    categories.map((cat) => [
      cat,
      templatesDB.filter((t) => t.category === cat).length,
    ])
  ) as Record<TemplateCategory, number>;

  return {
    total: templatesDB.length,
    active: templatesDB.filter((t) => t.status === "active").length,
    aiPowered: templatesDB.filter((t) => t.isAiPowered).length,
    recentlyUsed: templatesDB.filter(
      (t) => t.lastUsedAt && new Date(t.lastUsedAt).getTime() >= weekAgo
    ).length,
    byCategory,
  };
}

export function createTemplate(
  payload: CreateTemplatePayload
): CampaignTemplate {
  const now = new Date().toISOString();
  const template: CampaignTemplate = {
    id: `tpl_${Date.now()}`,
    name: payload.name,
    description: payload.description,
    category: payload.category,
    status: payload.status,
    language: payload.language,
    languages: [payload.language],
    surveyId: payload.surveyId,
    surveyName: payload.surveyName ?? "Custom Survey",
    voice: payload.voice,
    aiModel: payload.aiModel,
    isAiPowered: payload.aiModel !== "custom",
    estimatedDurationMinutes: 5,
    estimatedCallTimeMinutes: 4,
    questionCount: 0,
    usageCount: 0,
    icon: "sparkles",
    gradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/5",
    thumbnailAccent: "#8b5cf6",
    aiPromptPreview: "Configure your AI conversation prompt.",
    surveyFlow: [],
    questions: [],
    tags: [payload.category],
    createdAt: now,
    updatedAt: now,
  };
  templatesDB = [template, ...templatesDB];
  return template;
}

export function updateTemplate(
  id: string,
  payload: CreateTemplatePayload
): CampaignTemplate | undefined {
  const index = templatesDB.findIndex((t) => t.id === id);
  if (index === -1) return undefined;

  const now = new Date().toISOString();
  templatesDB[index] = {
    ...templatesDB[index],
    name: payload.name,
    description: payload.description,
    category: payload.category,
    status: payload.status,
    language: payload.language,
    languages: [payload.language],
    surveyId: payload.surveyId,
    surveyName: payload.surveyName ?? templatesDB[index].surveyName,
    voice: payload.voice,
    aiModel: payload.aiModel,
    isAiPowered: payload.aiModel !== "custom",
    updatedAt: now,
  };
  return templatesDB[index];
}

export function duplicateTemplate(id: string): CampaignTemplate | undefined {
  const source = getTemplateById(id);
  if (!source) return undefined;

  const now = new Date().toISOString();
  const copy: CampaignTemplate = {
    ...structuredClone(source),
    id: `tpl_${Date.now()}`,
    name: `${source.name} (Copy)`,
    status: "draft",
    usageCount: 0,
    lastUsedAt: undefined,
    createdAt: now,
    updatedAt: now,
  };
  templatesDB = [copy, ...templatesDB];
  return copy;
}

export function archiveTemplate(id: string): CampaignTemplate | undefined {
  const index = templatesDB.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  templatesDB[index] = {
    ...templatesDB[index],
    status: "archived",
    updatedAt: new Date().toISOString(),
  };
  return templatesDB[index];
}

export function deleteTemplate(id: string): boolean {
  const before = templatesDB.length;
  templatesDB = templatesDB.filter((t) => t.id !== id);
  return templatesDB.length < before;
}
