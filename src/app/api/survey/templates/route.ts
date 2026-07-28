import { NextResponse } from "next/server";
import { querySurveyTemplates } from "@/lib/data/survey-templates-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const industry = searchParams.get("industry") ?? "all";

  await new Promise((r) => setTimeout(r, 200));

  return NextResponse.json({
    success: true,
    data: querySurveyTemplates({ search, industry }),
  });
}
