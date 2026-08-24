import { Suspense } from "react";
import { VoicesListView } from "@/modules/voices";

export default function LibraryVoicesPage() {
  return (
    <Suspense fallback={<div className="min-h-40" aria-busy="true" />}>
      <VoicesListView />
    </Suspense>
  );
}
