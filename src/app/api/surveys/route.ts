import { NextResponse } from "next/server";
import { apiConfig } from "@/config/api";

const BACKEND = `${apiConfig.baseUrl}/surveys`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const url = qs ? `${BACKEND}?${qs}` : BACKEND;

  const res = await fetch(url, {
    headers: apiConfig.headers,
    cache: "no-store",
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(BACKEND, {
    method: "POST",
    headers: apiConfig.headers,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
