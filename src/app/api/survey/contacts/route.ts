import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy contact file fetch (Cloudinary etc.) to avoid browser CORS issues,
 * then return raw text for the client to parse.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")?.trim();

  if (!url) {
    return NextResponse.json(
      { success: false, message: "url is required" },
      { status: 400 }
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid url" },
      { status: 400 }
    );
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json(
      { success: false, message: "Only http(s) urls are allowed" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "text/csv,text/plain,*/*" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: `Upstream returned ${res.status}` },
        { status: 502 }
      );
    }

    const text = await res.text();
    return NextResponse.json({
      success: true,
      data: {
        text,
        contentType: res.headers.get("content-type") || "",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch contact file",
      },
      { status: 502 }
    );
  }
}
