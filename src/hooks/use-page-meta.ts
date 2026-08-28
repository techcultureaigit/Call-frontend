"use client";

import { useCallback, useEffect } from "react";
import { setDocumentTitle } from "@/lib/document-title";
import { useUIStore } from "@/stores";
import type { BreadcrumbItem } from "@/types";

interface UsePageMetaOptions {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function usePageMeta({ title, breadcrumbs = [] }: UsePageMetaOptions) {
  const setPageTitle = useUIStore((state) => state.setPageTitle);
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const resetStorePageMeta = useUIStore((state) => state.resetPageMeta);

  const breadcrumbsKey = breadcrumbs
    .map((item) => `${item.label}\0${item.href ?? ""}`)
    .join("\n");

  const applyMeta = useCallback(() => {
    setPageTitle(title);
    setBreadcrumbs(breadcrumbs);
    setDocumentTitle(title);
    // breadcrumbsKey tracks content — avoids new inline array refs retriggering meta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, breadcrumbsKey, setPageTitle, setBreadcrumbs]);

  const resetPageMeta = useCallback(() => {
    resetStorePageMeta();
    setDocumentTitle(null);
  }, [resetStorePageMeta]);

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  return { applyMeta, resetPageMeta };
}
