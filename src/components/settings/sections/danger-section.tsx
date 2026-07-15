"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsSectionCard } from "../settings-section-card";

type DangerAction = "account" | "organization" | "system" | null;

const DANGER_ACTIONS = [
  {
    id: "account" as const,
    title: "Delete Account",
    description:
      "Permanently delete your account and all personal data. This cannot be undone.",
    confirmText: "DELETE MY ACCOUNT",
  },
  {
    id: "organization" as const,
    title: "Delete Organization",
    description:
      "Remove the entire organization, all campaigns, customers, and team members.",
    confirmText: "DELETE ORGANIZATION",
  },
  {
    id: "system" as const,
    title: "Reset System",
    description:
      "Factory reset all configuration, integrations, and cached data.",
    confirmText: "RESET SYSTEM",
  },
];

export function DangerSection() {
  const [action, setAction] = useState<DangerAction>(null);
  const [confirmInput, setConfirmInput] = useState("");

  const current = DANGER_ACTIONS.find((a) => a.id === action);

  const handleConfirm = () => {
    if (!current || confirmInput !== current.confirmText) return;
    toast.error(`${current.title} — action simulated (no backend)`);
    setAction(null);
    setConfirmInput("");
  };

  return (
    <>
      <SettingsSectionCard
        title="Danger Zone"
        description="Irreversible and destructive actions"
        helpTooltip="These actions are permanent. Double confirmation is required."
        gradient="from-red-500/10 to-transparent"
        className="border-destructive/20"
      >
        <div className="space-y-3">
          {DANGER_ACTIONS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-destructive">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setAction(item.id)}
                className="shrink-0 rounded-xl"
              >
                <Trash2 className="size-3.5" />
                {item.title}
              </Button>
            </div>
          ))}
        </div>
      </SettingsSectionCard>

      <Dialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAction(null);
            setConfirmInput("");
          }
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              {current?.title}
            </DialogTitle>
            <DialogDescription>{current?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-sm">
              Type{" "}
              <strong className="font-mono text-destructive">
                {current?.confirmText}
              </strong>{" "}
              to confirm:
            </p>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={current?.confirmText}
              className="rounded-xl font-mono"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAction(null);
                setConfirmInput("");
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmInput !== current?.confirmText}
              onClick={handleConfirm}
              className="rounded-xl"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
