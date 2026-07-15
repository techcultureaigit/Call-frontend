import { NextResponse } from "next/server";
import {
  archiveTemplate,
  createTemplate,
  deleteTemplate,
  duplicateTemplate,
  getTemplateById,
  getTemplateStats,
  queryTemplates,
  updateTemplate,
} from "@/lib/data/campaign-templates-repository";
import type {
  CreateTemplatePayload,
  TemplateCategory,
  TemplateLanguage,
  TemplateStatus,
} from "@/types/campaign-template";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stats = searchParams.get("stats") === "true";
  const id = searchParams.get("id");

  await new Promise((r) => setTimeout(r, 220));

  if (stats) {
    return NextResponse.json({ success: true, data: getTemplateStats() });
  }

  if (id) {
    const template = getTemplateById(id);
    if (!template) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: template });
  }

  const data = queryTemplates({
    search: searchParams.get("search") ?? "",
    category: (searchParams.get("category") as TemplateCategory | "all") ?? "all",
    status: (searchParams.get("status") as TemplateStatus | "all") ?? "all",
    language: (searchParams.get("language") as TemplateLanguage | "all") ?? "all",
    aiOnly: searchParams.get("aiOnly") === "true",
  });

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateTemplatePayload;
  await new Promise((r) => setTimeout(r, 280));
  const template = createTemplate(body);
  return NextResponse.json({ success: true, data: template }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  await new Promise((r) => setTimeout(r, 180));

  if (body.action === "duplicate" && body.id) {
    const copy = duplicateTemplate(body.id);
    if (!copy) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: copy });
  }

  if (body.action === "archive" && body.id) {
    const archived = archiveTemplate(body.id);
    if (!archived) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: archived });
  }

  if (body.action === "update" && body.id && body.payload) {
    const updated = updateTemplate(body.id, body.payload as CreateTemplatePayload);
    if (!updated) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "ID required" }, { status: 400 });
  }

  const deleted = deleteTemplate(id);
  if (!deleted) {
    return NextResponse.json({ message: "Template not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
