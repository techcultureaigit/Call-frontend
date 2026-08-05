/** Central path map for Next.js `/api/*` routes */
export const apiEndpoints = {
  dashboard: "/api/dashboard",
  roles: {
    list: "/api/roles",
    detail: (id: string) => `/api/roles/${id}`,
  },
  users: {
    list: "/api/users",
    detail: (id: string) => `/api/users/${id}`,
  },
  surveys: {
    list: "/api/surveys",
    detail: (id: string) => `/api/surveys/${id}`,
    duplicate: (id: string) => `/api/surveys/${id}/duplicate`,
    schedule: (id: string) => `/api/surveys/${id}/schedule`,
    contactFile: (id: string) => `/api/surveys/${id}/contact-file`,
    questionsFile: (id: string) => `/api/surveys/${id}/questions-file`,
    results: (id: string) => `/api/surveys/${id}/results`,
    resultsExport: (id: string) => `/api/surveys/${id}/results/export`,
    resultDetail: (id: string, resultId: string) =>
      `/api/surveys/${id}/results/${resultId}`,
  },
  surveyTemplates: {
    list: "/api/survey/templates",
    detail: (id: string) => `/api/survey/templates/${id}`,
  },
  calls: {
    list: "/api/calls",
    detail: (id: string) => `/api/calls/${id}`,
  },
  responses: {
    list: "/api/responses",
    detail: (id: string) => `/api/responses/${id}`,
  },
  reports: "/api/reports",
  notifications: {
    list: "/api/notifications",
    detail: (id: string) => `/api/notifications/${id}`,
  },
  activityLogs: {
    list: "/api/activity-logs",
    detail: (id: string) => `/api/activity-logs/${id}`,
  },
  upload: {
    cloudinary: "/api/upload/cloudinary",
  },
  auth: {
    me: "/api/auth/me",
  },
  voices: {
    list: "/voices",
    detail: (id: string) => `/voices/${id}`,
  },
} as const;
