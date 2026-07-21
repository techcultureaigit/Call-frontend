export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Voice Agent Survey",
  description: "Enterprise CRM administration platform",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    docs: "/docs",
    support: "/support",
  },
} as const;

export type SiteConfig = typeof siteConfig;
