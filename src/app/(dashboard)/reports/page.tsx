import { redirect } from "next/navigation";

export default function ReportsRedirectPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, v));
    } else if (value != null) {
      query.set(key, value);
    }
  }
  const qs = query.toString();
  redirect(qs ? `/analytics?${qs}` : "/analytics");
}
