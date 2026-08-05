export const siteConfig = {
  /** Product brand — voice survey + calling CRM admin */
  name: "Voice Survey",
  tagline: "Voice Survey CRM ADMIN",
  description:
    "VoxCRM — voice survey and calling CRM administration platform",
  /** Absolute base URL for metadata/OG tags only — update for production deploy */
  url: "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    docs: "/docs",
    support: "/support",
  },
} as const;

export type SiteConfig = typeof siteConfig;
