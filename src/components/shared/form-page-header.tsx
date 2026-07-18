"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormPageHeaderProps {
  backHref: string;
  backLabel?: string;
  title: string;
  description?: string;
}

export function FormPageHeader({
  backHref,
  backLabel = "Back",
  title,
  description,
}: FormPageHeaderProps) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="gap-1.5 px-0" asChild>
        <Link href={backHref}>
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      </Button>

      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
