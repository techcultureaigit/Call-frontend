import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { saveMockContactFile } from "@/lib/server/mock-contact-files";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const configured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    const folder = process.env.CLOUDINARY_FOLDER || "survey-contacts";

    if (!configured) {
      const text = await file.text();
      const id = saveMockContactFile(file.name, text);
      const origin = new URL(request.url).origin;
      return NextResponse.json({
        success: true,
        data: {
          url: `${origin}/api/survey/contacts/file/${id}`,
          fileName: file.name,
          mock: true,
        },
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        fileName: file.name,
        mock: false,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
