/**
 * index.ts
 * voices module public exports.
 *
 * ── API (api.ts) ──────────────────────────────────────────────
 *   listVoices()  GET  /api/v1/voices
 *   getVoice()    GET  /api/v1/voices/:id
 *
 * ── Files ─────────────────────────────────────────────────────
 *   api.ts              — all HTTP API functions
 *   voice-mapper.ts     — backend mapping (used by api.ts)
 *   voices-list.tsx     — browse library → listVoices
 *   voice-preview-dialog.tsx — preview → getVoice
 */

export * from "./api";
export { voicesApi as api } from "./api";
export { listVoices, getVoice, filtersToVoicesParams } from "./api";
export * from "./gender-icons";
export * from "./voice-card";
export * from "./voices-list";
export * from "./voice-filters-sidebar";
export * from "./voice-picker-dialog";
export * from "./voice-preview-dialog";
export * from "./voices-pagination";
export * from "./voices-table";
export * from "./use-voices";
