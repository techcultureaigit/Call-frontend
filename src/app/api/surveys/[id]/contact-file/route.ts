import { NextResponse } from "next/server";
import { apiConfig } from "@/config/api";

const BACKEND = `${apiConfig.baseUrl}/surveys`;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();

  const res = await fetch(`${BACKEND}/${id}/contact-file`, {
    method: "POST",
    body: formData,
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
