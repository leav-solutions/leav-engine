import {type Application} from '../../types';
import {
    type PanelViewSettings,
    resetPanelViewSettingsInApplication,
    updatePanelViewSettingsInApplication,
} from '../updatePanelViewSettingsInApplication';
import {campaignsManagerApplication} from './campaignsManagerApplication.fixture';

describe('updatePanelViewSettingsInApplication', () => {
    const baseApplication: Application = {
        workspaces: [
            {
                id: '1',
                type: 'library',
                libraryId: 'home',
            },
        ],
        libraries: {
            home: {
                libraryPanels: [
                    {
                        id: 'panel1',
                        type: 'explorer',
                        actions: [],
                        isViewSettingsActive: false,
                    },
                ],
                recordPanels: [
                    {
                        id: 'panel2',
                        type: 'explorer',
                        actions: [],
                        isViewSettingsActive: false,
                    },
                ],
            },
        },
    };

    const viewSettings: PanelViewSettings = {
        isViewSettingsActive: true,
        selectedTab: 'filters',
        currentViewId: 'view1',
        targetLibraryId: 'home',
    };

    it('should update view settings on a panel in libraryPanels', () => {
        const newApplication = updatePanelViewSettingsInApplication(
            baseApplication,
            {libraryId: 'home', panelType: 'libraryPanels', panelId: 'panel1'},
            viewSettings,
        );

        expect(newApplication.libraries.home.libraryPanels[0]).toMatchObject(viewSettings);
    });

    it('should write the message-injected displayViewSettingsIframeSource onto the panel', () => {
        const newApplication = updatePanelViewSettingsInApplication(
            baseApplication,
            {libraryId: 'home', panelType: 'libraryPanels', panelId: 'panel1'},
            {...viewSettings, displayViewSettingsIframeSource: 'https://host/settings/rec-1/planning/configureView'},
        );

        expect(newApplication.libraries.home.libraryPanels[0]).toMatchObject({
            displayViewSettingsIframeSource: 'https://host/settings/rec-1/planning/configureView',
        });
    });

    it('should update view settings on a panel in recordPanels', () => {
        const newApplication = updatePanelViewSettingsInApplication(
            baseApplication,
            {libraryId: 'home', panelType: 'recordPanels', panelId: 'panel2'},
            viewSettings,
        );

        expect(newApplication.libraries.home.recordPanels[0]).toMatchObject(viewSettings);
    });

    it('should return an unchanged application when library is not found', () => {
        const newApplication = updatePanelViewSettingsInApplication(
            baseApplication,
            {libraryId: 'unknown', panelType: 'libraryPanels', panelId: 'panel1'},
            viewSettings,
        );

        expect(newApplication).toEqual(baseApplication);
    });

    it('should not mutate the original application', () => {
        const originalSnapshot = JSON.stringify(baseApplication);

        updatePanelViewSettingsInApplication(
            baseApplication,
            {libraryId: 'home', panelType: 'libraryPanels', panelId: 'panel1'},
            viewSettings,
        );

        expect(JSON.stringify(baseApplication)).toBe(originalSnapshot);
    });
});

/**
 * KPI A (LEAVC-948) — structural sharing must preserve referential identity on every branch that is
 * NOT on the path to the mutated panel. This is the binary proof that the memoization break (deep
 * clone recreating every nested reference, forcing all `application-settings` consumers to re-render)
 * is fixed. It runs against the real `campaigns_manager` config (5 libraries, 18 panels), and targets
 * the `campaigns` explorer nested in `map`'s record panels — a realistic view-settings toggle target.
 */
describe('updatePanelViewSettingsInApplication — structural sharing (LEAVC-948)', () => {
    const targetLocation = {libraryId: 'map', panelType: 'recordPanels', panelId: 'campaigns'} as const;
    const viewSettings: PanelViewSettings = {
        isViewSettingsActive: true,
        selectedTab: 'filters',
        currentViewId: 'someView',
        targetLibraryId: 'campaigns',
    };

    it('should preserve the reference of every library that is not the mutated one', () => {
        const result = updatePanelViewSettingsInApplication(campaignsManagerApplication, targetLocation, viewSettings);

        const untouchedLibraryIds = ['campaigns', 'events', 'requests', 'thematics'] as const;
        const preservedLibraries = untouchedLibraryIds.filter(
            libraryId => result.libraries[libraryId] === campaignsManagerApplication.libraries[libraryId],
        );

        expect(preservedLibraries).toEqual([...untouchedLibraryIds]);
        expect(result.workspaces).toBe(campaignsManagerApplication.workspaces);
    });

    it('should preserve the reference of the untouched panel array inside the mutated library', () => {
        const result = updatePanelViewSettingsInApplication(campaignsManagerApplication, targetLocation, viewSettings);

        expect(result.libraries.map.libraryPanels).toBe(campaignsManagerApplication.libraries.map.libraryPanels);
    });

    it('should preserve the reference of every sibling panel and only recreate the targeted one', () => {
        const result = updatePanelViewSettingsInApplication(campaignsManagerApplication, targetLocation, viewSettings);

        const previousRecordPanels = campaignsManagerApplication.libraries.map.recordPanels;
        const preservedSiblings = result.libraries.map.recordPanels.filter((panel, index) =>
            panel.id === targetLocation.panelId ? false : panel === previousRecordPanels[index],
        );

        // 5 record panels on `map`; 4 siblings keep their reference, only `campaigns` is recreated.
        expect(preservedSiblings).toHaveLength(previousRecordPanels.length - 1);
    });

    it('should recreate only the references on the path to the mutated panel', () => {
        const result = updatePanelViewSettingsInApplication(campaignsManagerApplication, targetLocation, viewSettings);

        expect(result).not.toBe(campaignsManagerApplication);
        expect(result.libraries).not.toBe(campaignsManagerApplication.libraries);
        expect(result.libraries.map).not.toBe(campaignsManagerApplication.libraries.map);
        expect(result.libraries.map.recordPanels).not.toBe(campaignsManagerApplication.libraries.map.recordPanels);
    });

    it('should merge the view settings into the targeted panel', () => {
        const result = updatePanelViewSettingsInApplication(campaignsManagerApplication, targetLocation, viewSettings);

        const updatedPanel = result.libraries.map.recordPanels.find(panel => panel.id === targetLocation.panelId);

        expect(updatedPanel).toMatchObject(viewSettings);
    });

    it('should return the very same application reference when the library is not found', () => {
        const result = updatePanelViewSettingsInApplication(
            campaignsManagerApplication,
            {libraryId: 'unknown', panelType: 'libraryPanels', panelId: 'whatever'},
            viewSettings,
        );

        expect(result).toBe(campaignsManagerApplication);
    });
});

describe('resetPanelViewSettingsInApplication', () => {
    const activeApplication: Application = {
        workspaces: [
            {
                id: '1',
                type: 'library',
                libraryId: 'home',
            },
        ],
        libraries: {
            home: {
                libraryPanels: [
                    {
                        id: 'panel1',
                        type: 'explorer',
                        actions: [],
                        isViewSettingsActive: true,
                        selectedTab: 'filters',
                        currentViewId: 'view1',
                        targetLibraryId: 'home',
                        displayViewSettingsIframeSource: 'https://host/settings/rec-1/planning/configureView',
                    },
                ],
                recordPanels: [],
            },
        },
    };

    it('should reset the view settings of the targeted panel to their closed state', () => {
        const newApplication = resetPanelViewSettingsInApplication(activeApplication, {
            libraryId: 'home',
            panelType: 'libraryPanels',
            panelId: 'panel1',
        });

        expect(newApplication.libraries.home.libraryPanels[0]).toMatchObject({
            isViewSettingsActive: false,
            selectedTab: undefined,
            currentViewId: undefined,
            targetLibraryId: undefined,
            displayViewSettingsIframeSource: undefined,
        });
    });
});
