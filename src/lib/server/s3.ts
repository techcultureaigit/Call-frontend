import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "ap-south-1";
const bucket = process.env.AWS_S3_BUCKET || "";
const contactsFolder = process.env.AWS_S3_CONTACTS_FOLDER || "survey-contacts";
const voicesFolder = process.env.AWS_S3_VOICES_FOLDER || "voice-previews";






















































































































































































































































































































































































































































































































































































const recordingsFolder =
  process.env.AWS_S3_RECORDINGS_FOLDER || "call-recordings";
const allowedFolders = [contactsFolder, voicesFolder, recordingsFolder];

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

/**
 * Stored URLs look like call-recordings/{10-digit cli}/{id}.
 * Objects are stored as call-recordings/91{cli}/{id}.mp3.
 */
function recordingKeyCandidates(key: string): string[] {
  const list: string[] = [];
  const add = (value: string) => {
    if (value && !list.includes(value)) list.push(value);
  };

  const nested = key.match(/^call-recordings\/(\d+)\/([^/]+)$/i);
  if (nested) {
    const phone = nested[1];
    const file = nested[2];
    const id = file.replace(/\.[^.]+$/, "");
    const ext = file.includes(".") ? file.slice(file.lastIndexOf(".")) : ".mp3";
    const withCountry = phone.startsWith("91") ? phone : `91${phone}`;
    add(`call-recordings/${withCountry}/${id}${ext}`);
    add(`call-recordings/${phone}/${id}${ext}`);
    add(`call-recordings/${id}.mp3`);
  }

  add(key);
  if (!/\.[a-z0-9]+$/i.test(key)) add(`${key}.mp3`);
  return list;
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

  const key = getS3ObjectKey(urlOrKey);
  if (!key) {
    throw new Error("Not an S3 object URL");
  }

  const candidates = key.startsWith(`${recordingsFolder}/`)
    ? recordingKeyCandidates(key)
    : [key];
  let missingKey = key;
  for (const candidate of candidates) {
    try {
      return await s3.send(new GetObjectCommand({ Bucket: bucket, Key: candidate }));
    } catch (error) {
      if (!isNoSuchKey(error)) throw error;
      missingKey = candidate;
    }
  }

  const fallback = await findLatestMatchingKey(candidates[0] || key);
  if (!fallback || candidates.includes(fallback)) {
    throw new Error(`The specified key does not exist (${missingKey})`);
  }
  return s3.send(new GetObjectCommand({ Bucket: bucket, Key: fallback }));
}
