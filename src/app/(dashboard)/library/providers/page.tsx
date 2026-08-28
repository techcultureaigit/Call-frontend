import type { Metadata } from "next";
import { ProvidersListView } from "@/modules/providers";

export const metadata: Metadata = {
  title: "Agent Providers",
};

export default function ProvidersPage() {
  return <ProvidersListView />;
}
