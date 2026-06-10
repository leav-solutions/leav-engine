import {type Application} from '../../types';
import {type PanelViewSettings, updatePanelViewSettingsInApplication} from '../updatePanelViewSettingsInApplication';

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
