import { NextResponse } from "next/server";
import {
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} from "@/lib/data/customers-repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const customer = getCustomerById(id);
  if (!customer) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: customer });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const customer = updateCustomer(id, body);
  if (!customer) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: customer });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const deleted = deleteCustomer(id);
  if (!deleted) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: null });
}
