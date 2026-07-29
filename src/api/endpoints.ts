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
  customers: {
    list: "/api/customers",
    detail: (id: string) => `/api/customers/${id}`,
  },
  surveys: {
    list: "/api/surveys",
    detail: (id: string) => `/api/surveys/${id}`,
    duplicate: (id: string) => `/api/surveys/${id}/duplicate`,
    schedule: (id: string) => `/api/surveys/${id}/schedule`,
    unschedule: (id: string) => `/api/surveys/${id}/unschedule`,
    contactFile: (id: string) => `/api/surveys/${id}/contact-file`,
    questionsFile: (id: string) => `/api/surveys/${id}/questions-file`,
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
} as const;
