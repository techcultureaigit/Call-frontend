"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsAutosaveIndicator } from "./settings-status-badge";

interface SettingsSaveBarProps {
  visible: boolean;
  status: "idle" | "saving" | "saved" | "unsaved";
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
}

export function SettingsSaveBar({
  visible,
  status,
  onSave,
  onDiscard,
  isSaving,
}: SettingsSaveBarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/90 px-4 py-3 shadow-elevated backdrop-blur-xl lg:left-[var(--sidebar-width,0px)]"
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <SettingsAutosaveIndicator status={status} />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDiscard}
                disabled={isSaving}
                className="rounded-xl"
              >
                <RotateCcw className="size-3.5" />
                Discard
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="rounded-xl"
              >
                <Save className="size-3.5" />
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
