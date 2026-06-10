import type * as z from 'zod/v4';
import {type baseExplorerPanelSchema} from '_ui/hooks/usePanelMessenger/schema';
import {type Application} from '../types';

export type PanelViewSettings = Pick<
    z.infer<typeof baseExplorerPanelSchema>,
    'isViewSettingsActive' | 'selectedTab' | 'currentViewId' | 'targetLibraryId'
>;

export const updatePanelViewSettingsInApplication = (
    prevApplication: Application,
    location: {libraryId: string; panelType: keyof Application['libraries'][string]; panelId: string},
    viewSettings: PanelViewSettings,
): Application => {
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
