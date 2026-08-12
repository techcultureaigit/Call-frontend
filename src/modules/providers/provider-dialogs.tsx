"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { AppLoaderSpinner } from "@/components/shared/app-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PROVIDER_TYPE_HINT,
  PROVIDER_TYPE_LABEL,
  PROVIDER_TYPE_OPTIONS,
  type ProviderFormValues,
  type ProviderItem,
  type ProviderModel,
  type ProviderType,
} from "./provider-types";
import { toast } from "sonner";

interface ProviderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ProviderItem | null;
  onSubmit: (values: ProviderFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ProviderFormDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isLoading,
}: ProviderFormDialogProps) {
  const isEdit = Boolean(item);
  const [type, setType] = useState<ProviderType>("stt");
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [modelInput, setModelInput] = useState("");
  const [active, setActive] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setType(item?.type ?? "stt");
    setName(item?.name || item?.provider || "");
    setDisplayName(item?.displayName || item?.name || item?.provider || "");
    setModels(
      (item?.models ?? []).map((m) => ({
        id: m.id ?? null,
        name: m.name,
      }))
    );
    setModelInput("");
    setActive(item?.active ?? item?.isActive ?? true);
    setEditingIndex(null);
    setEditValue("");
  }, [open, item]);

  useEffect(() => {
    if (editingIndex === null) return;
    editInputRef.current?.focus();
    editInputRef.current?.select();
  }, [editingIndex]);

  const addModel = () => {
    const name = modelInput.trim();
    if (!name) return;
    if (models.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Model already added");
      return;
    }
    setModels((prev) => [...prev, { id: null, name }]);
    setModelInput("");
  };

  const removeModel = (index: number) => {
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditValue("");
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
    setModels((prev) => prev.filter((_, i) => i !== index));
  };

  const startRename = (index: number) => {
    setEditingIndex(index);
    setEditValue(models[index]?.name ?? "");
  };

  const cancelRename = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const confirmRename = () => {
    if (editingIndex === null) return;
    const next = editValue.trim();
    if (!next) {
      toast.error("Model name is required");
      return;
    }
    const duplicate = models.some(
      (m, i) =>
        i !== editingIndex && m.name.toLowerCase() === next.toLowerCase()
    );
    if (duplicate) {
      toast.error("Model already added");
      return;
    }
    setModels((prev) =>
      prev.map((m, i) => (i === editingIndex ? { ...m, name: next } : m))
    );
    setEditingIndex(null);
    setEditValue("");
  };

  const handleSave = async () => {
    if (editingIndex !== null) {
      toast.error("Finish renaming the model first");
      return;
    }
    if (!name.trim()) {
      toast.error("Provider name is required");
      return;
    }
    if (models.length === 0) {
      toast.error("Add at least one model");
      return;
    }
    await onSubmit({
      type,
      name: name.trim(),
      displayName: displayName.trim() || name.trim(),
      models,
      active,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit provider" : "Add provider"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Rename provider or models, then save. Changes update this provider by id."
              : "Choose type, then add provider and its models."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as ProviderType)}
                options={PROVIDER_TYPE_OPTIONS}
                className="rounded-[6px]"
              />
              <p className="text-xs text-muted-foreground">{PROVIDER_TYPE_HINT[type]}</p>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-[6px] border border-border/60 px-3 py-2.5 sm:min-w-44">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Survey dropdowns</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Provider name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Google"
                className="rounded-[6px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Display name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Google Cloud"
                className="rounded-[6px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Models</Label>
              <span className="text-xs text-muted-foreground">
                {models.length} model{models.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="Add model name…"
                className="rounded-[6px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addModel();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addModel}
                className="rounded-[6px]"
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>

            {models.length > 0 ? (
              <ul className="mt-2 divide-y divide-border/60 overflow-hidden rounded-[6px] border border-border/60">
                {models.map((m, index) => {
                  const isRenaming = editingIndex === index;
                  return (
                    <li
                      key={m.id || `new-${index}-${m.name}`}
                      className="flex items-center gap-2 bg-muted/30 px-2 py-1.5"
                    >
                      {isRenaming ? (
                        <>
                          <Input
                            ref={editInputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 flex-1 rounded-[6px] text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                confirmRename();
                              }
                              if (e.key === "Escape") {
                                e.preventDefault();
                                cancelRename();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 shrink-0 text-emerald-600 hover:text-emerald-700"
                            onClick={confirmRename}
                            aria-label="Confirm rename"
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 shrink-0 text-muted-foreground"
                            onClick={cancelRename}
                            aria-label="Cancel rename"
                          >
                            <X className="size-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 truncate px-1 text-sm font-medium">
                            {m.name}
                          </span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => startRename(index)}
                            aria-label={`Rename ${m.name}`}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeModel(index)}
                            aria-label={`Remove ${m.name}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="pt-1 text-xs text-muted-foreground">
                No models yet — add at least one.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-[6px]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={isLoading}
            className="rounded-[6px]"
          >
            {isLoading && <AppLoaderSpinner size="sm" className="mr-1" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ProviderItem | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteProviderDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading,
}: DeleteProviderDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete provider</DialogTitle>
          <DialogDescription>
            Delete{" "}
            <span className="font-medium text-foreground">
              {item.displayName || item.name || item.provider}
            </span>{" "}
            ({PROVIDER_TYPE_LABEL[item.type]}) and its {item.models.length}{" "}
            model
            {item.models.length === 1 ? "" : "s"}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-[6px]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-[6px]"
          >
            {isLoading && <AppLoaderSpinner size="sm" className="mr-1" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
