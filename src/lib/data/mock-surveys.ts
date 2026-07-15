import type { Survey } from "@/types/survey";

export const MOCK_SURVEYS: Survey[] = [
  {
    id: "srv_001",
    name: "Enterprise NPS Survey",
    description: "Net Promoter Score survey for enterprise accounts",
    status: "active",
    questionCount: 12,
    estimatedDurationMinutes: 5,
    responseCount: 1240,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "srv_002",
    name: "Product Feedback Loop",
    description: "Post-purchase product satisfaction survey",
    status: "active",
    questionCount: 8,
    estimatedDurationMinutes: 3,
    responseCount: 578,
    createdAt: "2025-03-20T10:00:00Z",
    updatedAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "srv_003",
    name: "Customer Renewal Intent",
    description: "Pre-renewal satisfaction and intent survey",
    status: "active",
    questionCount: 10,
    estimatedDurationMinutes: 4,
    responseCount: 412,
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
  },
  {
    id: "srv_004",
    name: "Healthcare CX Assessment",
    description: "Patient experience and care quality survey",
    status: "active",
    questionCount: 15,
    estimatedDurationMinutes: 7,
    responseCount: 890,
    createdAt: "2025-02-10T10:00:00Z",
    updatedAt: "2026-03-05T10:00:00Z",
  },
  {
    id: "srv_005",
    name: "Churn Risk Diagnostic",
    description: "Identify at-risk customers before churn",
    status: "active",
    questionCount: 6,
    estimatedDurationMinutes: 3,
    responseCount: 298,
    createdAt: "2025-08-01T10:00:00Z",
    updatedAt: "2025-12-10T10:00:00Z",
  },
  {
    id: "srv_006",
    name: "Onboarding Experience",
    description: "New customer onboarding feedback",
    status: "draft",
    questionCount: 9,
    estimatedDurationMinutes: 4,
    responseCount: 0,
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z",
  },
];

export function generateSurveyId(): string {
  return `srv_${Date.now().toString(36)}`;
}
