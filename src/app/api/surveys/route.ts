import { NextResponse } from "next/server";
import {
  backendAuthHeaders,
  proxyJsonResponse,
  surveysBackendUrl,
} from "./_proxy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const url = qs ? `${surveysBackendUrl()}?${qs}` : surveysBackendUrl();

  try {
    const res = await fetch(url, {
      headers: backendAuthHeaders(request),
      cache: "no-store",
    });
    return proxyJsonResponse(res);
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message:
          "Cannot reach CRM backend. Check NEXT_PUBLIC_API_URL and that the API is running.",
      },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const res = await fetch(surveysBackendUrl(), {
      method: "POST",
      headers: {
        ...backendAuthHeaders(request),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return proxyJsonResponse(res);
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message:
          "Cannot reach CRM backend. Check NEXT_PUBLIC_API_URL and that the API is running.",
      },
      { status: 502 }
    );
  }
}
