import { NextResponse } from "next/server";
import { backendAuthHeaders, surveysBackendUrl } from "./_proxy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const url = qs ? `${surveysBackendUrl()}?${qs}` : surveysBackendUrl();

  const res = await fetch(url, {
    headers: backendAuthHeaders(request),
    cache: "no-store",
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(surveysBackendUrl(), {
    method: "POST",
    headers: {
      ...backendAuthHeaders(request),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
