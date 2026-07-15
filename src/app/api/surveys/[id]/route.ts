import { NextResponse } from "next/server";
import {
  deleteSurvey,
  getSurveyDetail,
  saveSurvey,
  toggleSurveyPublish,
} from "@/lib/data/surveys-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await new Promise((r) => setTimeout(r, 200));

  const survey = getSurveyDetail(id);
  if (!survey) {
    return NextResponse.json({ message: "Survey not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: survey });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.action === "publish") {
    const result = toggleSurveyPublish(id, Boolean(body.published));
    if (!result) {
      return NextResponse.json({ message: "Survey not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result });
  }

  const result = saveSurvey(id, body);
  if (!result) {
    return NextResponse.json({ message: "Survey not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: result });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteSurvey(id);
  if (!deleted) {
    return NextResponse.json({ message: "Survey not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
