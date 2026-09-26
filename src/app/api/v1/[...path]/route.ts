import http from "node:http";
import https from "node:https";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "content-encoding",
]);

/** Express base, never the browser path `/api/v1` (that would loop). */
function upstreamBase(): string {
  const raw = (
    process.env.BACKEND_ORIGIN ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api/v1"
  ).replace(/\/$/, "");

  if (!/^https?:\/\//i.test(raw)) {
    return "http://127.0.0.1:8000/api/v1";
  }

  const normalized = raw.replace("://localhost", "://127.0.0.1");
  return normalized.endsWith("/api/v1") ? normalized : `${normalized}/api/v1`;
}

function proxyRequest(
  target: string,
  method: string,
  headers: Headers,
  body?: Buffer
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
  const url = new URL(target);
  const lib = url.protocol === "https:" ? https : http;
  const headerRecord: Record<string, string> = {};

  headers.forEach((value, key) => {
    headerRecord[key] = value;
  });
  if (body) headerRecord["content-length"] = String(body.length);

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method,
        headers: headerRecord,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 502,
            headers: res.headers,
            body: Buffer.concat(chunks),
          })
        );
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function forward(request: NextRequest, path: string[]) {
  const target = `${upstreamBase()}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const upstream = await proxyRequest(
      target,
      request.method,
      headers,
      hasBody ? Buffer.from(await request.arrayBuffer()) : undefined
    );

    const responseHeaders = new Headers();
    for (const [key, value] of Object.entries(upstream.headers)) {
      if (value == null) continue;
      const name = key.toLowerCase();
      if (name === "set-cookie" || HOP_BY_HOP.has(name)) continue;
      responseHeaders.set(key, Array.isArray(value) ? value.join(", ") : value);
    }

    const cookies = upstream.headers["set-cookie"];
    if (Array.isArray(cookies)) {
      for (const cookie of cookies) responseHeaders.append("set-cookie", cookie);
    } else if (cookies) {
      responseHeaders.append("set-cookie", cookies);
    }

    return new NextResponse(new Uint8Array(upstream.body), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    console.error(`API proxy failed for ${target}: ${reason}`);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: `Cannot reach CRM backend at ${upstreamBase()}`,
      },
      { status: 502 }
    );
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forward(request, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
