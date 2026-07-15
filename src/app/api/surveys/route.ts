import { NextResponse } from "next/server";
import {
  createSurvey,
  listActiveSurveys,
  listSurveys,
} from "@/lib/data/surveys-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") === "true";
  const search = searchParams.get("search") ?? "";

  await new Promise((r) => setTimeout(r, 180));

  const data = activeOnly ? listActiveSurveys() : listSurveys(search);

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const survey = createSurvey(body);
  return NextResponse.json({ success: true, data: survey }, { status: 201 });
}
