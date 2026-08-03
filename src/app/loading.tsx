"use client";

import { AppLoader } from "@/components/ui/app-loader";

export default function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <AppLoader variant="section" label="Loading" className="w-full max-w-3xl border-0" />
    </div>
  );
}
