/**
 * Normalize Cloudinary contact-file URL for opening in browser.
 * Strips fl_attachment (forces download) and keeps a clean .csv/.xlsx URL.
 */
export function getContactFileOpenUrl(url: string): string {
  const trimmed = url?.trim();
  if (!trimmed) return "";

  // Remove fl_attachment:.../ so browser can open the file instead of force-download
  return trimmed.replace(/\/upload\/fl_attachment:[^/]+\//, "/upload/");
}
