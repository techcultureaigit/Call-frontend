/**
 * index.ts
 * settings module public exports.
 *
 * ── API (api.ts) ──────────────────────────────────────────────
 *   getSettings()   GET   /api/settings (mock)
 *   saveSettings()  POST  /api/settings (mock)
 *
 * ── Files ─────────────────────────────────────────────────────
 *   api.ts               — all HTTP API functions
 *   settings-types.ts    — types (no API)
 *   settings-constants.ts — defaults and nav config
 *   settings-view.tsx    — settings page → getSettings, saveSettings
 */

export * from "./api";
export { settingsApi as api } from "./api";
export type * from "./settings-types";
export * from "./settings-breadcrumbs";
export * from "./settings-field";
export * from "./settings-nav";
export * from "./settings-save-bar";
export * from "./settings-search";
export * from "./settings-section-card";
export * from "./settings-status-badge";
export * from "./settings-toggle-row";
export * from "./settings-view";
