import { Suspense } from "react";
import { VoiceExplorerView } from "@/components/library/voices";

export default function LibraryVoicesPage() {
  return (
    <Suspense fallback={<div className="min-h-40" aria-busy="true" />}>
      <VoiceExplorerView />
    </Suspense>
  );
}
