import { getS3Object, getS3ObjectKey } from "@/lib/server/s3";
import { unauthorizedIfNoSession } from "@/lib/server/require-session";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

/**
 * Proxy contact file fetch for logged-in users.
 * Private S3 objects are read with server env credentials — never sent to the browser.
 */
export async function GET(request: NextRequest) {
  const denied = unauthorizedIfNoSession(request);
  if (denied) return denied;

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
    let buffer: Buffer;
    let contentType = "";

    if (getS3ObjectKey(url)) {
      const object = await getS3Object(url);
      const bytes = await object.Body?.transformToByteArray();
      if (!bytes) {
        return NextResponse.json(
          { success: false, message: "Empty S3 object" },
          { status: 502 }
        );
      }
      buffer = Buffer.from(bytes);
      contentType = (object.ContentType || "").toLowerCase();
    } else {
      const res = await fetch(url, {
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/octet-stream,*/*",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        return NextResponse.json(
          { success: false, message: `Upstream returned ${res.status}` },
          { status: 502 }
        );
      }

      buffer = Buffer.from(await res.arrayBuffer());
      contentType = (res.headers.get("content-type") || "").toLowerCase();
    }

    const pathname = parsed.pathname.toLowerCase();
    const isCsv =
      pathname.endsWith(".csv") ||
      contentType.includes("csv") ||
      contentType.includes("text/plain");

    let rows: Record<string, string>[] = [];

    if (isCsv && buffer[0] !== 0x50) {
      const text = buffer.toString("utf-8");
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length >= 2) {
        const headers = lines[0]
          .split(",")
          .map((h) => h.replace(/^\uFEFF/, "").trim());
        rows = lines.slice(1).map((line) => {
          const values = line.split(",");
          const row: Record<string, string> = {};
          headers.forEach((header, i) => {
            if (!header) return;
            row[header] = (values[i] ?? "").trim();
          });
          return row;
        });
      }
    } else {
      const book = XLSX.read(buffer, { type: "buffer", cellDates: true });
      const sheetName = book.SheetNames[0];
      if (sheetName) {
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          book.Sheets[sheetName],
          { defval: "", raw: false }
        );
        rows = jsonRows.map((row) => {
          const out: Record<string, string> = {};
          for (const [key, value] of Object.entries(row)) {
            const header = String(key || "")
              .replace(/^\uFEFF/, "")
              .trim();
            if (!header) continue;
            out[header] = String(value ?? "").trim();
          }
          return out;
        });
      }
    }

    rows = rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").trim())
    );

    return NextResponse.json({
      success: true,
      data: {
        rows,
        contentType,
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
