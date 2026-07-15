import { RoleFormView } from "@/components/roles/role-form-view";

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoleFormView roleId={id} />;
}
