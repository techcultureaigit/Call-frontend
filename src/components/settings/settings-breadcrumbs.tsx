"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSettingsNavItem } from "@/lib/constants/settings-navigation";
import type { SettingsSectionId } from "@/types/settings";

export function SettingsBreadcrumbs({
  activeSection,
}: {
  activeSection: SettingsSectionId;
}) {
  const item = getSettingsNavItem(activeSection);

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link
        href="/settings"
        className="transition-colors hover:text-foreground"
      >
        Settings
      </Link>
      <ChevronRight className="size-3.5" />
      <span className="font-medium text-foreground">
        {item?.label ?? "General"}
      </span>
    </nav>
  );
}
