const S3_HOST = /amazonaws\.com/i;
const S3_SIGN_QUERY = /X-Amz-Algorithm=/i;

export function isS3FileUrl(url: string): boolean {
  const value = url?.trim() || "";
  if (!value) return false;
  if (S3_HOST.test(value) || S3_SIGN_QUERY.test(value)) return true;
  const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "";
  return Boolean(bucket && value.includes(bucket));
}

export function stripS3Query(url: string): string {
  const value = url?.trim() || "";
  if (!value) return "";
  try {
    const parsed = new URL(value);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return value.split("?")[0];
  }
}

export function getS3KeyFromUrl(url: string): string {
  const value = stripS3Query(url);
  if (!value) return "";
  if (!/^https?:\/\//i.test(value)) return value.replace(/^\/+/, "");
  try {
    const parsed = new URL(value);
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  } catch {
    return "";
  }
}

export function getContactFileOpenUrl(url: string): string {
  const trimmed = url?.trim();
  if (!trimmed) return "";
  if (isS3FileUrl(trimmed)) {
    const key = getS3KeyFromUrl(trimmed);
    return key
      ? `/api/s3/file?key=${encodeURIComponent(key)}`
      : `/api/s3/file?url=${encodeURIComponent(stripS3Query(trimmed))}`;
  }
  return trimmed;
}

export function getContactFileDisplayUrl(url: string): string {
  const trimmed = url?.trim();
  if (!trimmed) return "";
  return isS3FileUrl(trimmed) ? stripS3Query(trimmed) : trimmed;
}
