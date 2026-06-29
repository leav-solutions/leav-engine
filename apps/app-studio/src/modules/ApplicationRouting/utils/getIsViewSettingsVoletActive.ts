import {type Application} from '../types';

type Panel = Application['libraries'][string]['libraryPanels'][number];

/**
 * Single source of truth for "is the view settings volet open for this panel". The volet only exists
 * for explorer panels and is driven by their `isViewSettingsActive` flag. Accepts a nullable panel so
 * the resolved (Panel.tsx) and the possibly-absent (useViewSettingsAutoClose) call sites share the
 * exact same predicate — preventing the two from drifting apart.
 */
export const getIsViewSettingsVoletActive = (panel: Panel | null | undefined): boolean =>
    panel?.type === 'explorer' && panel.isViewSettingsActive;
