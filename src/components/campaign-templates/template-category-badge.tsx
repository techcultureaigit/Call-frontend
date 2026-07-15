"use client";

import { Badge } from "@/components/ui/badge";
import { TEMPLATE_CATEGORY_OPTIONS } from "@/lib/constants/campaign-templates";
import { cn } from "@/lib/utils";
import type { TemplateCategory } from "@/types/campaign-template";

export function TemplateCategoryBadge({
  category,
  className,
}: {
  category: TemplateCategory;
  className?: string;
}) {
  const label =
    TEMPLATE_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ??
    category;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize",
        className
      )}
    >
      {label}
    </Badge>
  );
}
