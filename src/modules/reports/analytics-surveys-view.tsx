"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** By-survey report was removed — analytics now lives on each survey. */
export function AnalyticsSurveysView() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/survey");
  }, [router]);
  return null;
}
