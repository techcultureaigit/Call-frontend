"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Building2,
  CreditCard,
  GraduationCap,
  Headphones,
  Heart,
  MessageSquare,
  Package,
  Shield,
  Target,
  Truck,
  Users,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AgentTemplate } from "@/types/agent-template";

const ICON_MAP: Record<string, LucideIcon> = {
  graduation: GraduationCap,
  book: BookOpen,
  building: Building2,
  users: Users,
  truck: Truck,
  package: Package,
  shield: Shield,
  message: MessageSquare,
  heart: Heart,
  credit: CreditCard,
  target: Target,
  headset: Headphones,
};

interface AgentTemplateCardProps {
  template: AgentTemplate;
  index?: number;
  onViewDetails: (template: AgentTemplate) => void;
}

export function AgentTemplateCard({
  template,
  index = 0,
  onViewDetails,
}: AgentTemplateCardProps) {
  const Icon = ICON_MAP[template.icon] ?? Volume2;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="group relative flex h-full flex-col"
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[6px] opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          "bg-gradient-to-br from-primary/30 via-violet-500/20 to-fuchsia-500/10 blur-sm"
        )}
      />

      <div className="relative flex h-full flex-col overflow-hidden rounded-[6px] border border-border/50 bg-card/90 shadow-card backdrop-blur-sm transition-all duration-300 group-hover:border-primary/25 group-hover:shadow-elevated">
        <div
          className={cn(
            "relative px-5 pb-3 pt-5 bg-gradient-to-br",
            template.gradient
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-[6px] border border-white/20 bg-white/15 shadow-inner backdrop-blur-md"
              style={
                template.accent
                  ? { borderColor: `${template.accent}33` }
                  : undefined
              }
            >
              <Icon className="size-5 text-foreground/90" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold tracking-tight">
                {template.name}
              </h3>
              <Badge
                variant="outline"
                className="mt-1.5 rounded-full border-border/60 bg-background/60 px-2.5 py-0 text-[10px] font-medium"
              >
                {template.industryLabel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-muted-foreground">
            {template.description}
          </p>

          <div className="mt-4 flex gap-2 border-t border-border/40 pt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-[6px]"
              onClick={() => onViewDetails(template)}
            >
              View Details
            </Button>
            <Button
              size="sm"
              className="flex-1 rounded-[6px]"
              asChild
            >
              <Link href={`/agents/new?template=${template.id}`}>
                + Create Agent
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
