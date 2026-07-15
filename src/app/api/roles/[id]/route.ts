import { NextResponse } from "next/server";
import { deleteRole, getRoleById, updateRole } from "@/lib/data/roles-repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const role = getRoleById(id);

  if (!role) {
    return NextResponse.json({ message: "Role not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: role });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const role = updateRole(id, body);

  if (!role) {
    return NextResponse.json({ message: "Role not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: role });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const result = deleteRole(id);

  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: null });
}
