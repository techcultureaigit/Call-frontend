import type { ProviderItem, ProviderModel, ProviderType } from "./provider-types";
import { modelLabel, providerLabel } from "./provider-types";

const UNSELECT = { label: "— None —", value: "" };

export function providersForType(
  rows: ProviderItem[],
  type: ProviderType,
  withUnselect = true
): { label: string; value: string }[] {
  const opts = rows
    .filter((r) => r.type === type && r.isActive !== false && r.active !== false)
    .map((r) => ({ label: providerLabel(r), value: r.id }));
  return withUnselect ? [UNSELECT, ...opts] : opts;
}

export function modelsForProviderId(
  rows: ProviderItem[],
  providerId: string,
  withUnselect = true
): { label: string; value: string }[] {
  if (!providerId) return withUnselect ? [UNSELECT] : [];
  const row = rows.find((r) => r.id === providerId);
  const opts = (row?.models ?? []).map((m: ProviderModel) => ({
    label: modelLabel(m),
    value: m.id || m.name,
  }));
  return withUnselect ? [UNSELECT, ...opts] : opts;
}

export function resolveProviderId(
  rows: ProviderItem[],
  type: ProviderType,
  providerName: string,
  providerId?: string
): string {
  const needle = (providerName || "").trim().toLowerCase();
  if (providerId) {
    const byId = rows.find((r) => r.id === providerId);
    if (byId && byId.type === type) {
      if (!needle || providerLabel(byId).toLowerCase() === needle) return providerId;
    }
  }
  if (!needle) return "";
  return (
    rows.find(
      (r) => r.type === type && providerLabel(r).toLowerCase() === needle
    )?.id ?? ""
  );
}

export function resolveModelId(
  rows: ProviderItem[],
  providerId: string,
  modelName: string,
  modelId?: string
): string {
  if (!providerId) return "";
  const row = rows.find((r) => r.id === providerId);
  if (!row) return "";
  if (modelId && row.models.some((m) => m.id === modelId || m.name === modelId)) {
    return row.models.find((m) => m.id === modelId || m.name === modelId)?.id || modelId;
  }
  if (!modelName) return "";
  const needle = modelName.trim().toLowerCase();
  const hit = row.models.find((m) => m.name.toLowerCase() === needle);
  return hit?.id || hit?.name || "";
}

export function selectedModelValue(
  options: { label: string; value: string }[],
  modelId?: string,
  modelName?: string
): string {
  if (modelId && options.some((o) => o.value === modelId)) return modelId;
  if (modelName) {
    const byLabel = options.find(
      (o) => o.label.toLowerCase() === modelName.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
    if (options.some((o) => o.value === modelName)) return modelName;
  }
  return "";
}

export function providerNameById(rows: ProviderItem[], providerId: string): string {
  const row = rows.find((r) => r.id === providerId);
  return row ? providerLabel(row) : "";
}

export function modelNameById(
  rows: ProviderItem[],
  providerId: string,
  modelId: string
): string {
  const row = rows.find((r) => r.id === providerId);
  if (!row || !modelId) return "";
  const hit = row.models.find((m) => m.id === modelId || m.name === modelId);
  return hit ? modelLabel(hit) : "";
}
