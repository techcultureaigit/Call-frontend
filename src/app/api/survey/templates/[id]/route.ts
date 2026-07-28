import { NextResponse } from "next/server";
import { getSurveyTemplateById } from "@/lib/data/survey-templates-repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const template = getSurveyTemplateById(id);

  if (!template) {
    return NextResponse.json(
      { message: "Survey template not found" },
      { status: 404 }
    );
  }

  await new Promise((r) => setTimeout(r, 150));

  return NextResponse.json({ success: true, data: template });
}
