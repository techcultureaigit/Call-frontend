import { UserFormView } from "@/components/users/user-form-view";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserFormView userId={id} />;
}
