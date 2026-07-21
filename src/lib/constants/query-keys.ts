export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
    profile: ["auth", "profile"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params?: Record<string, unknown>) =>
      ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    module: (params?: Record<string, unknown>) =>
      ["users", "module", params] as const,
  },
  accounts: {
    all: ["accounts"] as const,
    list: (params?: Record<string, unknown>) =>
      ["accounts", "list", params] as const,
    detail: (id: string) => ["accounts", "detail", id] as const,
  },
  contacts: {
    all: ["contacts"] as const,
    list: (params?: Record<string, unknown>) =>
      ["contacts", "list", params] as const,
    detail: (id: string) => ["contacts", "detail", id] as const,
  },
  leads: {
    all: ["leads"] as const,
    list: (params?: Record<string, unknown>) =>
      ["leads", "list", params] as const,
    detail: (id: string) => ["leads", "detail", id] as const,
  },
  deals: {
    all: ["deals"] as const,
    list: (params?: Record<string, unknown>) =>
      ["deals", "list", params] as const,
    detail: (id: string) => ["deals", "detail", id] as const,
    pipeline: (id: string) => ["deals", "pipeline", id] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    list: (params?: Record<string, unknown>) =>
      ["tasks", "list", params] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
  },
  activities: {
    all: ["activities"] as const,
    list: (params?: Record<string, unknown>) =>
      ["activities", "list", params] as const,
    detail: (id: string) => ["activities", "detail", id] as const,
  },
  reports: {
    all: ["reports"] as const,
    dashboard: ["reports", "dashboard"] as const,
    sales: (params?: Record<string, unknown>) =>
      ["reports", "sales", params] as const,
    data: (params?: Record<string, unknown>) =>
      ["reports", "data", params] as const,
  },
  dashboard: {
    overview: ["dashboard", "overview"] as const,
  },
  roles: {
    all: ["roles"] as const,
    module: (params?: Record<string, unknown>) =>
      ["roles", "module", params] as const,
    detail: (id: string) => ["roles", "detail", id] as const,
  },
  customers: {
    all: ["customers"] as const,
    module: (params?: Record<string, unknown>) =>
      ["customers", "module", params] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
  },
  surveys: {
    all: ["surveys"] as const,
    list: (params?: Record<string, unknown>) =>
      ["surveys", "list", params] as const,
    detail: (id: string) => ["surveys", "detail", id] as const,
  },
  calls: {
    all: ["calls"] as const,
    module: (params?: Record<string, unknown>) =>
      ["calls", "module", params] as const,
    detail: (id: string) => ["calls", "detail", id] as const,
    stats: () => ["calls", "stats"] as const,
  },
  responses: {
    all: ["responses"] as const,
    module: (params?: Record<string, unknown>) =>
      ["responses", "module", params] as const,
    detail: (id: string) => ["responses", "detail", id] as const,
    stats: () => ["responses", "stats"] as const,
    filters: () => ["responses", "filters"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    module: (params?: Record<string, unknown>) =>
      ["notifications", "module", params] as const,
    feed: () => ["notifications", "feed"] as const,
    stats: () => ["notifications", "stats"] as const,
    detail: (id: string) => ["notifications", "detail", id] as const,
  },
  activityLogs: {
    all: ["activityLogs"] as const,
    module: (params?: Record<string, unknown>) =>
      ["activityLogs", "module", params] as const,
    stats: () => ["activityLogs", "stats"] as const,
    filters: () => ["activityLogs", "filters"] as const,
    detail: (id: string) => ["activityLogs", "detail", id] as const,
  },
} as const;
