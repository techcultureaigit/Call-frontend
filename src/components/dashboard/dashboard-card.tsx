import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
  noPadding = false,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow duration-200 hover:shadow-elevated",
        className
      )}
    >
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-border/50 pb-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-inset ring-brand/15">
              <Icon className="size-[18px]" />
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-[15px]">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn("pt-5", noPadding && "p-0 pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
