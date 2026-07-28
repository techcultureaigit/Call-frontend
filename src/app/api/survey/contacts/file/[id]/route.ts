import { NextResponse } from "next/server";
import { getMockContactFile } from "@/lib/server/mock-contact-files";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Serves CSV content for mock uploads (when Cloudinary env is not configured). */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const file = getMockContactFile(id);

  if (!file) {
    return NextResponse.json(
      { success: false, message: "File not found or expired — re-upload the contact CSV" },
      { status: 404 }
    );
  }

  return new NextResponse(file.text, {
    status: 200,
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.fileName)}"`,
      "Cache-Control": "no-store",
    },
  });
}
