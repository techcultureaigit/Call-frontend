export const siteConfig = {
  /** Product brand — Ai Agent TechCulture admin */
  name: "TechCall",
  tagline: "AI Voice & Survey CRM",
  description:
    "TechCall — TechCulture AI voice survey and calling administration platform",
  /** Absolute base URL for metadata/OG tags only — update for production deploy */
  url: "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    docs: "/docs",
    support: "/support",
  },
} as const;

export type SiteConfig = typeof siteConfig;
