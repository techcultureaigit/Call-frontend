import { NextResponse } from "next/server";
import { apiConfig } from "@/config/api";

const BACKEND = `${apiConfig.baseUrl}/surveys`;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(`${BACKEND}/${id}/schedule`, {
    method: "POST",
    headers: apiConfig.headers,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
