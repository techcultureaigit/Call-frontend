"use client";

import { useCallback } from "react";
import { useUIStore } from "@/stores";
import type { BreadcrumbItem } from "@/types";

interface UsePageMetaOptions {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function usePageMeta({ title, breadcrumbs = [] }: UsePageMetaOptions) {
  const setPageTitle = useUIStore((state) => state.setPageTitle);
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const resetPageMeta = useUIStore((state) => state.resetPageMeta);

  const applyMeta = useCallback(() => {
    setPageTitle(title);
    setBreadcrumbs(breadcrumbs);
  }, [title, breadcrumbs, setPageTitle, setBreadcrumbs]);

  return { applyMeta, resetPageMeta };
}
