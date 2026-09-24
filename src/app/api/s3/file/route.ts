import { getS3Object } from "@/lib/server/s3";
import { unauthorizedIfNoSession } from "@/lib/server/require-session";
import { NextRequest, NextResponse } from "next/server";

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
        "Content-Type": object.ContentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read S3 file";
    const status = /does not exist/i.test(message) ? 404 : 502;
    return NextResponse.json({ success: false, message }, { status });
  }
}
