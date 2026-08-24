/**
 * index.ts
 * Survey module public exports.
 *
 * ── API (api.ts) ──────────────────────────────────────────────
 *   listSurveys()              GET    /api/surveys
 *   getSurvey()                GET    /api/surveys/:id
 *   saveSurvey()               POST   /api/surveys
 *   duplicateSurvey()          POST   /api/surveys/:id/duplicate
 *   scheduleSurvey()           POST   /api/surveys/:id/schedule
 *   deleteSurvey()             DELETE /api/surveys/:id
 *   bulkDeleteSurveys()        DELETE /api/surveys/:id  (per id)
 *   listSurveyResults()        GET    /api/surveys/:id/results
 *   getSurveyResult()          GET    /api/surveys/:id/results/:resultId
 *   exportSurveyResults()      GET    /api/surveys/:id/results/export
 *   uploadSurveyContactFile()  POST   /api/surveys/:id/contact-file
 *   uploadSurveyQuestionsFile() POST  /api/surveys/:id/questions-file
 *
 * ── Files ─────────────────────────────────────────────────────
 *   api.ts              — all HTTP API functions
 *   survey-types.ts     — types (no API)
 *   survey-mapper.ts    — backend mapping (used by api.ts)
 *   survey-list.tsx     — list page → listSurveys, delete, schedule, duplicate
 *   survey-by-id.tsx    — load by id → getSurvey
 *   survey-form.tsx     — create/edit → saveSurvey
 *   survey-detail.tsx   — detail view → duplicate, schedule
 *   survey-response.tsx — results → list, get, export results
 *   survey-tabs.tsx     — form tabs → upload questions, contacts
 *   survey-dialogs.tsx  — dialogs (no direct API)
 *   survey-export.ts    — client-side CSV/xlsx export
 *   survey-upload.ts    — parse questions file (client-side)
 *   survey-contacts.ts  — parse contact file (client-side)
 *   survey-actions.tsx  — actions page (mock UI, no API)
 */

export { SurveyListView, SurveysTable } from "./survey-list";
export { SurveyCreateEditView } from "./survey-form";
export { SurveyDetailView } from "./survey-detail";
export {
  SurveyDetailLoader,
  SurveyCreateEditLoader,
  SurveyFetchLoader,
  useSurveyById,
} from "./survey-by-id";
export {
  SurveyResponseView,
  SurveyResponseDetailView,
} from "./survey-response";
export { SurveyActionsView } from "./survey-actions";
export { AgentActionsManager } from "./survey-actions-manager";

export {
  listSurveys,
  getSurvey,
  saveSurvey,
  deleteSurvey,
  bulkDeleteSurveys,
  duplicateSurvey,
  scheduleSurvey,
  unscheduleSurvey,
  listSurveyResults,
  getSurveyResult,
  exportSurveyResults,
  uploadSurveyContactFile,
  uploadSurveyQuestionsFile,
  surveysApi,
} from "./api";

export type {
  SurveyResultRow,
  SurveyResultsExportFormat,
  SurveyResultAnswer,
  SurveyResultQuestionMeta,
  SurveyResultsSurveyMeta,
  SurveysListParams,
  SurveyResultsListParams,
  SaveSurveyInput,
  ScheduleSurveyInput,
} from "./survey-types";

export { exportSurveys } from "./survey-export";
export {
  parseAndValidateSurveyQuestionsFile,
  downloadSurveyQuestionsSample,
  downloadClientContactsSample,
} from "./survey-upload";
export {
  DeleteSurveyDialog,
  ScheduleSurveyDialog,
  SurveyScheduleFields,
  SurveyStatusBadge,
} from "./survey-dialogs";

/** @deprecated */
export { SurveyCreateEditView as SurveyConfigureView } from "./survey-form";
export { SurveyCreateEditLoader as SurveyConfigureLoader } from "./survey-by-id";
export { SurveyResponseView as SurveyResultsView } from "./survey-response";
export { SurveyResponseDetailView as SurveyResultDetailView } from "./survey-response";

/** @deprecated use survey-lib */
export {
  DEFAULT_SURVEY_SCHEDULE,
  isSurveyReadyToSchedule,
  getSurveySchedule,
  getSurveyDisplayStatus,
} from "./survey-lib";
