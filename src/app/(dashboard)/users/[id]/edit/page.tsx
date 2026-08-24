import { UsersCreateEditLoader } from "@/modules/users/users-by-id";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UsersCreateEditLoader id={id} />;
}
