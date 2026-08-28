import { siteConfig } from "@/config/site";

/** Browser tab title — matches root layout metadata template. */
export function formatDocumentTitle(pageTitle?: string | null): string {
  const trimmed = pageTitle?.trim();
  if (!trimmed) return siteConfig.name;
  return `${trimmed} | ${siteConfig.name}`;
}

export function setDocumentTitle(pageTitle?: string | null): void {
  if (typeof document === "undefined") return;
  document.title = formatDocumentTitle(pageTitle);
}
