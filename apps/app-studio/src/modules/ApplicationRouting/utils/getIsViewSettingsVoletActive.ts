import {type Application} from '../types';

type Panel = Application['libraries'][string]['libraryPanels'][number];

/**
 * Single source of truth for "is the view settings volet open for this panel". The volet exists for
 * explorer panels AND for custom panels that host it (e.g. planning); both carry the
 * `isViewSettingsActive` flag (factored into `viewSettingsStateSchema`). Accepts a nullable panel so
 * the resolved (Panel.tsx) and the possibly-absent (useViewSettingsAutoClose) call sites share the
 * exact same predicate — preventing the two from drifting apart.
 */
export const getIsViewSettingsVoletActive = (panel: Panel | null | undefined): boolean =>
    (panel?.type === 'explorer' || panel?.type === 'custom') && Boolean(panel.isViewSettingsActive);
