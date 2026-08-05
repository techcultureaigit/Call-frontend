/**
 * api.ts
 * Settings HTTP API — all backend calls live here.
 * Debug: [settings-api] in DevTools console.
 * Currently uses client-side mock data until BFF route is available.
 *
 * getSettings()  GET   /api/settings (mock)
 * saveSettings() POST  /api/settings (mock)
 */
import { createModuleApiCall } from "@/lib/api/module-helpers";
import type { AppSettings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "./settings-constants";
import type { SaveSettingsInput } from "./settings-types";

const settingsCall = createModuleApiCall("settings");

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

let cachedSettings: AppSettings = deepClone(DEFAULT_SETTINGS);

/* ========== READ — GET /api/settings (mock) ========== */

/** getSettings() → mock load (simulates network delay) */
export async function getSettings(): Promise<AppSettings> {
  return settingsCall("getSettings", "GET", "/api/settings", async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return deepClone(cachedSettings);
  });
}

/* ========== UPDATE — POST /api/settings (mock) ========== */

/** saveSettings() → mock save */
export async function saveSettings(
  input: SaveSettingsInput
): Promise<AppSettings> {
  return settingsCall("saveSettings", "POST", "/api/settings", async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    cachedSettings = deepClone(input.settings);
    return deepClone(cachedSettings);
  }, { sections: Object.keys(input.settings) });
}

/* ---------- namespace ---------- */
export const settingsApi = {
  get: getSettings,
  save: saveSettings,
};
