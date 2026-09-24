import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "ap-south-1";
const bucket = process.env.AWS_S3_BUCKET || "";
const contactsFolder = process.env.AWS_S3_CONTACTS_FOLDER || "survey-contacts";
const voicesFolder = process.env.AWS_S3_VOICES_FOLDER || "voice-previews";
const allowedFolders = [contactsFolder, voicesFolder];

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

function publicBase() {
  return (
    process.env.AWS_S3_PUBLIC_URL ||
    `https://${bucket}.s3.${region}.amazonaws.com`
  ).replace(/\/$/, "");
}

export function getS3ObjectKey(urlOrKey: string): string {
  const raw = String(urlOrKey || "").trim();
  if (!raw || !bucket) return "";

  if (!/^https?:\/\//i.test(raw)) {
    const key = raw.replace(/^\/+/, "");
    if (allowedFolders.some((folder) => key.startsWith(`${folder}/`))) {
      return key.includes("..") ? "" : key;
    }
    return "";
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return "";
  }

  const host = parsed.hostname.toLowerCase();
  const pathname = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  if (!pathname || pathname.includes("..")) return "";

  if (
    host === `${bucket}.s3.${region}.amazonaws.com`.toLowerCase() ||
    host === `${bucket}.s3.amazonaws.com`.toLowerCase() ||
    (host.startsWith(`${bucket.toLowerCase()}.s3.`) && host.endsWith(".amazonaws.com"))
  ) {
    return pathname;
  }

  if (
    (host.startsWith("s3.") || host === "s3.amazonaws.com") &&
    host.endsWith(".amazonaws.com") &&
    pathname.startsWith(`${bucket}/`)
  ) {
    return pathname.slice(bucket.length + 1);
  }

  const base = publicBase();
  const unsigned = `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "");
  if (base && unsigned.startsWith(`${base}/`)) {
    return unsigned.slice(base.length + 1);
  }

  if (host.includes("amazonaws.com") && pathname.startsWith(`${bucket}/`)) {
    return pathname.slice(bucket.length + 1);
  }

  return "";
}

function isNoSuchKey(error: unknown): boolean {
  const err = error as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number } };
  return (
    err?.name === "NoSuchKey" ||
    err?.Code === "NoSuchKey" ||
    err?.$metadata?.httpStatusCode === 404
  );
}

async function findLatestMatchingKey(key: string): Promise<string> {
  const slash = key.lastIndexOf("/");
  const folder = slash >= 0 ? key.slice(0, slash + 1) : "";
  const file = slash >= 0 ? key.slice(slash + 1) : key;
  const stem = file.replace(/_\d{10,}(?=\.[^.]+$)/, "").replace(/\.[^.]+$/, "");
  if (!stem) return "";

  const listed = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: `${folder}${stem}`,
      MaxKeys: 50,
    })
  );

  const matches = (listed.Contents || [])
    .filter((item) => item.Key)
    .sort(
      (a, b) =>
        new Date(b.LastModified || 0).getTime() -
        new Date(a.LastModified || 0).getTime()
    );

  return matches[0]?.Key || "";
}

export async function getS3Object(urlOrKey: string) {
  if (!bucket || !process.env.AWS_ACCESS_KEY_ID) {
    throw new Error("AWS S3 is not configured on the frontend (.env)");
  }

  let key = getS3ObjectKey(urlOrKey);
  if (!key) {
    throw new Error("Not an S3 object URL");
  }

  try {
    return await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  } catch (error) {
    if (!isNoSuchKey(error)) throw error;
    const fallback = await findLatestMatchingKey(key);
    if (!fallback || fallback === key) {
      throw new Error(`The specified key does not exist (${key})`);
    }
    key = fallback;
    return s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  }
}
