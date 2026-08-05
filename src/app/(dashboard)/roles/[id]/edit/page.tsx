import { RolesCreateEditLoader } from "@/modules/roles/roles-by-id";

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RolesCreateEditLoader id={id} />;
}
