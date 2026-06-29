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
    const library = prevApplication.libraries[location.libraryId];
    if (!library) {
        return prevApplication;
    }

    // Structural sharing: recreate only the objects on the path to the mutated panel and keep the
    // references of every untouched branch, so memoization holds and `application-settings` consumers
    // on intact branches do not re-render.
    return {
        ...prevApplication,
        libraries: {
            ...prevApplication.libraries,
            [location.libraryId]: {
                ...library,
                [location.panelType]: library[location.panelType].map(panel =>
                    panel.id === location.panelId ? {...panel, ...viewSettings} : panel,
                ),
            },
        },
    };
};

export const resetPanelViewSettingsInApplication = (
    prevApplication: Application,
    location: PanelLocation,
): Application => updatePanelViewSettingsInApplication(prevApplication, location, RESET_VIEW_SETTINGS);
