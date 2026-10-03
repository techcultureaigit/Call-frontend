import { getS3Object } from "@/lib/server/s3";
import { unauthorizedIfNoSession } from "@/lib/server/require-session";
import { NextRequest, NextResponse } from "next/server";

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

/** Extensionless call recordings are often stored without an audio content type. */
function recordingContentType(
  bytes: Uint8Array,
  stored: string | undefined,
  target: string
) {
  const generic =
    !stored ||
    stored === "application/octet-stream" ||
    stored === "binary/octet-stream";
  if (!generic || !target.includes("call-recordings")) {
    return stored || "application/octet-stream";
  }
  if (bytes.length >= 12) {
    if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WAVE") {
      return "audio/wav";
    }
    if (ascii(bytes, 0, 4) === "OggS") return "audio/ogg";
    if (ascii(bytes, 4, 8) === "ftyp") return "audio/mp4";
    if (ascii(bytes, 0, 3) === "ID3") return "audio/mpeg";
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) {
    return "audio/mpeg";
  }
  return stored || "application/octet-stream";
}

export async function GET(request: NextRequest) {
  const denied = unauthorizedIfNoSession(request);
  if (denied) return denied;

  const key = request.nextUrl.searchParams.get("key")?.trim();
  const url = request.nextUrl.searchParams.get("url")?.trim();
  const target = key || url;

  if (!target) {
    return NextResponse.json(
      { success: false, message: "key or url is required" },
      { status: 400 }
    );
  }

  try {
    const object = await getS3Object(target);
    const bytes = await object.Body?.transformToByteArray();
    if (!bytes) {
      return NextResponse.json(
        { success: false, message: "Empty S3 object" },
        { status: 502 }
      );
    }

    const filename = (key || url || "file")
      .split("?")[0]
      .split("/")
      .filter(Boolean)
      .pop() || "file";

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": recordingContentType(bytes, object.ContentType, target),
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read S3 file";
    const status = /does not exist/i.test(message) ? 404 : 502;
    return NextResponse.json(
      { success: false, message },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
