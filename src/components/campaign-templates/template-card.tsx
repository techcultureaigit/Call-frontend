"use client";

import { motion } from "framer-motion";
import {
  Archive,
  Clock,
  Copy,
  Eye,
  HelpCircle,
  Languages,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGE_LABELS } from "@/lib/constants/campaign-templates";
import {
  cn,
  formatCompactNumber,
  formatRelativeTime,
} from "@/lib/utils";
import { TemplateCategoryBadge } from "./template-category-badge";
import { TemplateIcon } from "./template-icon";
import { TemplateStatusBadge } from "./template-status-badge";
import type { CampaignTemplate } from "@/types/campaign-template";

interface TemplateCardProps {
  template: CampaignTemplate;
  index?: number;
  onPreview: (template: CampaignTemplate) => void;
  onDuplicate: (id: string) => void;
  onEdit: (template: CampaignTemplate) => void;
  onArchive: (id: string) => void;
  onDelete: (template: CampaignTemplate) => void;
  isActionLoading?: boolean;
}

export function TemplateCard({
  template,
  index = 0,
  onPreview,
  onDuplicate,
  onEdit,
  onArchive,
  onDelete,
  isActionLoading,
}: TemplateCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          "bg-gradient-to-br from-primary/40 via-violet-500/30 to-fuchsia-500/20 blur-sm"
        )}
      />

      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-card backdrop-blur-sm transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-elevated">
        <div
          className={cn(
            "relative h-28 overflow-hidden bg-gradient-to-br",
            template.gradient
          )}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 80% 20%, ${template.thumbnailAccent}55, transparent 55%)`,
            }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNCAwLTcuNzMyIDYuMjY4LTE0IDE0LTE0czE0IDYuMjY4IDE0IDE0LTYuMjY4IDE0LTE0IDE0eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDMiLz48L2c+PC9zdmc+')] opacity-40" />

          <div className="relative flex h-full items-start justify-between p-4">
            <TemplateIcon
              name={template.icon}
              accent={template.thumbnailAccent}
            />
            <div className="flex items-center gap-1.5">
              {template.isAiPowered && (
                <Badge className="rounded-full border-0 bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-md">
                  AI
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 rounded-lg bg-background/40 text-foreground backdrop-blur-md hover:bg-background/70"
                    disabled={isActionLoading}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                  <DropdownMenuItem onClick={() => onPreview(template)}>
                    <Eye className="size-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                    <Copy className="size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(template)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onArchive(template.id)}>
                    <Archive className="size-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(template)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <TemplateStatusBadge status={template.status} />
              <TemplateCategoryBadge category={template.category} />
            </div>
            <h3 className="line-clamp-1 text-base font-semibold tracking-tight">
              {template.name}
            </h3>
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {template.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/40 bg-muted/20 p-3 text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3 shrink-0" />
              <span>{template.estimatedDurationMinutes} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HelpCircle className="size-3 shrink-0" />
              <span>{template.questionCount} questions</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Languages className="size-3 shrink-0" />
              <Badge
                variant="outline"
                className="h-5 rounded-md px-1.5 text-[10px] font-semibold"
              >
                {LANGUAGE_LABELS[template.language]}
              </Badge>
            </div>
            <div className="text-right tabular-nums text-muted-foreground">
              {formatCompactNumber(template.usageCount)} uses
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
            <span>Updated {formatRelativeTime(template.updatedAt)}</span>
          </div>

          <div className="flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl"
              onClick={() => onPreview(template)}
            >
              <Eye className="size-3.5" />
              Preview
            </Button>
            <Button
              size="sm"
              className="flex-1 rounded-xl"
              onClick={() => onEdit(template)}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
