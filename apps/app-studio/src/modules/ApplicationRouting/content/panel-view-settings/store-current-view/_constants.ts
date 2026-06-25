/**
 * Sentinel id of the synthetic "default view" draft seeded in the store for an admin landing on a
 * library with no view to configure (`isEmptyView`). It is editable (so the gear/columns/sorts work
 * and `isDirty`/Reset behave) and serialized for ExplorerV2's live preview, but never persisted as-is
 * — "Save as" creates a real view from it via `createViewV2`.
 */
export const DEFAULT_DRAFT_VIEW_ID = '__default_draft__';
