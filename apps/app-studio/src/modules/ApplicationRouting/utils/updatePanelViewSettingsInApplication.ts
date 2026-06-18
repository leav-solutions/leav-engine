import type * as z from 'zod/v4';
import {type baseExplorerPanelSchema} from '_ui/hooks/usePanelMessenger/schema';
import {type Application} from '../types';

export type PanelViewSettings = Pick<
    z.infer<typeof baseExplorerPanelSchema>,
    'isViewSettingsActive' | 'selectedTab' | 'currentViewId' | 'targetLibraryId'
>;

type PanelLocation = {libraryId: string; panelType: keyof Application['libraries'][string]; panelId: string};

/**
 * Single source of truth for the "closed" view settings state. Typed as PanelViewSettings so adding a
 * field to that type forces this constant to be updated, preventing a stale value from leaking on reset.
 */
const RESET_VIEW_SETTINGS: PanelViewSettings = {
    isViewSettingsActive: false,
    selectedTab: undefined,
    currentViewId: undefined,
    targetLibraryId: undefined,
};

export const updatePanelViewSettingsInApplication = (
    prevApplication: Application,
    location: PanelLocation,
    viewSettings: PanelViewSettings,
): Application => {
    // TODO(LEAVC-948): replace this full deep clone with structural sharing — it serializes the whole
    // app config on every call and breaks memoization (fresh refs force all settings consumers to re-render).
    const newApplication = JSON.parse(JSON.stringify(prevApplication)) as Application;

    const library = newApplication.libraries[location.libraryId];
    if (!library) {
        return newApplication;
    }

    library[location.panelType] = library[location.panelType].map(panel =>
        panel.id === location.panelId ? {...panel, ...viewSettings} : panel,
    );

    return newApplication;
};

export const resetPanelViewSettingsInApplication = (
    prevApplication: Application,
    location: PanelLocation,
): Application => updatePanelViewSettingsInApplication(prevApplication, location, RESET_VIEW_SETTINGS);
