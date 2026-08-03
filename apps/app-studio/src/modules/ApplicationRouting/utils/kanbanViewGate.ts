import {type Application} from '../types';

/**
 * Feature gate of the ExplorerV2 Kanban display mode (product decision 2026-07-29: kanban is mergeable
 * but not prod-ready). Gating happens at selection time only: when off, the kanban tile is not offered
 * in the view display settings, so no new view can be switched to kanban. Views already persisted as
 * kanban are NOT downgraded — they are to be cleaned up in database if needed.
 *
 * Double-flag rule: `enableKanbanView` is only effective when `enableViewSettings` is also on — the
 * kanban mode is built on the V2 views system (ExplorerV2 + volet), which that first flag gates.
 */
export const isKanbanViewEnabled = (application: Application | null | undefined): boolean =>
    Boolean(application?.enableViewSettings && application?.enableKanbanView);
