/**
 * Normalize contact/questions file URL for opening in browser.
 * Cloudinary: strip fl_attachment. S3 public URLs are used as-is.
 */
export function getContactFileOpenUrl(url: string): string {
  const trimmed = url?.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/upload\/fl_attachment:[^/]+\//, "/upload/");
}
