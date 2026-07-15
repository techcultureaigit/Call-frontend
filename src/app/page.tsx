import { redirect } from "next/navigation";
import { routePaths } from "@/config/navigation";

export default function HomePage() {
  redirect(routePaths.dashboard);
}
