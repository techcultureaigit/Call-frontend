"use client";

import {
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Rocket,
  Square,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Campaign } from "@/types/campaign";

interface CampaignActionsProps {
  campaign: Campaign;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
  onRetry: (id: string) => void;
  onLaunch: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  variant?: "buttons" | "menu";
}

export function CampaignActions({
  campaign,
  onPause,
  onResume,
  onStop,
  onRetry,
  onLaunch,
  onDelete,
  isLoading,
  variant = "menu",
}: CampaignActionsProps) {
  const canPause = campaign.status === "active";
  const canResume = campaign.status === "paused";
  const canStop = ["active", "paused", "scheduled"].includes(campaign.status);
  const canRetry = campaign.stats.failedCalls > 0 && campaign.status !== "completed";
  const canLaunch = ["draft", "scheduled"].includes(campaign.status);

  if (variant === "buttons") {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {canLaunch && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={isLoading}
            onClick={() => onLaunch(campaign.id)}
          >
            <Rocket className="size-3" />
            Launch
          </Button>
        )}
        {canPause && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={isLoading}
            onClick={() => onPause(campaign.id)}
          >
            <Pause className="size-3" />
            Pause
          </Button>
        )}
        {canResume && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={isLoading}
            onClick={() => onResume(campaign.id)}
          >
            <Play className="size-3" />
            Resume
          </Button>
        )}
        {canStop && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs text-destructive hover:text-destructive"
            disabled={isLoading}
            onClick={() => onStop(campaign.id)}
          >
            <Square className="size-3" />
            Stop
          </Button>
        )}
        {canRetry && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={isLoading}
            onClick={() => onRetry(campaign.id)}
          >
            <RefreshCw className="size-3" />
            Retry Failed
          </Button>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="size-8" disabled={isLoading}>
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {canLaunch && (
          <DropdownMenuItem onClick={() => onLaunch(campaign.id)}>
            <Rocket className="size-4" />
            Launch
          </DropdownMenuItem>
        )}
        {canPause && (
          <DropdownMenuItem onClick={() => onPause(campaign.id)}>
            <Pause className="size-4" />
            Pause
          </DropdownMenuItem>
        )}
        {canResume && (
          <DropdownMenuItem onClick={() => onResume(campaign.id)}>
            <Play className="size-4" />
            Resume
          </DropdownMenuItem>
        )}
        {canStop && (
          <DropdownMenuItem onClick={() => onStop(campaign.id)}>
            <Square className="size-4" />
            Stop
          </DropdownMenuItem>
        )}
        {canRetry && (
          <DropdownMenuItem onClick={() => onRetry(campaign.id)}>
            <RefreshCw className="size-4" />
            Retry Failed Calls
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(campaign.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
