import { NextResponse } from "next/server";
import { createRole, queryRoles } from "@/lib/data/roles-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";

  await new Promise((resolve) => setTimeout(resolve, 250));

  return NextResponse.json({
    success: true,
    data: queryRoles({ search }),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const role = createRole({
    name: body.name,
    description: body.description,
    color: body.color,
    permissions: body.permissions,
  });

  return NextResponse.json({ success: true, data: role }, { status: 201 });
}
