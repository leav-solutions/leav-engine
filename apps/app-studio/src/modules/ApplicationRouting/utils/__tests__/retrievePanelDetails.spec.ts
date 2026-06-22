import {type Application} from '../../types';
import {retrievePanelDetails} from '../retrievePanelDetails';

describe('retrievePanelDetails', () => {
    const emptyApplication: Application = {
        workspaces: [
            {
                id: '1',
                title: {
                    fr: 'Test',
                },
                type: 'library',
                libraryId: 'home',
            },
        ],
        libraries: {
            home: {
                libraryPanels: [],
                recordPanels: [],
            },
        },
    };

    it('should provide null values on unknown panelId', async () => {
        const {currentPanel, libraryId, panelType, displayedLibraryId} = retrievePanelDetails({
            application: emptyApplication,
            panelId: 'unknown',
        });

        expect(currentPanel).toBeNull();
        expect(libraryId).toBeNull();
        expect(panelType).toBeNull();
        expect(displayedLibraryId).toBeNull();
    });

    it('should locate the panel by its id (libraryPanels)', async () => {
        const panelId = '1';
        const baseApplication: Application = {
            ...emptyApplication,
            libraries: {
                ...emptyApplication.libraries,
                home: {
                    ...emptyApplication.libraries.home,
                    libraryPanels: [
                        {
                            id: panelId,
                            type: 'explorer',
                            isViewSettingsActive: false,
                            actions: [],
                        },
                    ],
                },
            },
        };

        const {currentPanel, libraryId, panelType, displayedLibraryId} = retrievePanelDetails({
            application: baseApplication,
            panelId,
        });

        expect(panelType).toBe('libraryPanels');
        expect(libraryId).toBe('home');
        // A library explorer shows its owner library, so both coincide.
        expect(displayedLibraryId).toBe('home');
        expect(currentPanel).toEqual({
            id: panelId,
            type: 'explorer',
            isViewSettingsActive: false,
            actions: [],
        });
    });

    it('should resolve displayedLibraryId to the LINKED library for a record-panel link explorer', () => {
        const recordPanelId = 'linked-campaigns';
        const baseApplication: Application = {
            ...emptyApplication,
            libraries: {
                ...emptyApplication.libraries,
                home: {
                    ...emptyApplication.libraries.home,
                    recordPanels: [
                        {
                            id: recordPanelId,
                            type: 'explorer',
                            isViewSettingsActive: false,
                            actions: [],
                            attributeSource: 'home_linked_campaigns',
                            libraryId: 'campaigns',
                        },
                    ],
                },
            },
        };

        const {libraryId, panelType, displayedLibraryId} = retrievePanelDetails({
            application: baseApplication,
            recordPanelId,
        });

        expect(panelType).toBe('recordPanels');
        // The panel is configured under its OWNER library (the parent record's library)...
        expect(libraryId).toBe('home');
        // ...but the explorer DISPLAYS the linked library — which is what the view settings target.
        expect(displayedLibraryId).toBe('campaigns');
    });

    it('should locate the panel by its id (recordPanels)', async () => {
        const recordPanelId = '1';
        const baseApplication: Application = {
            ...emptyApplication,
            libraries: {
                ...emptyApplication.libraries,
                home: {
                    ...emptyApplication.libraries.home,
                    recordPanels: [
                        {
                            id: recordPanelId,
                            type: 'custom',
                            iframeSource: 'https://fakeurl.aristid.com',
                            isSelfContaining: true,
                            isStandalone: true,
                        },
                    ],
                },
            },
        };

        const {currentPanel, libraryId, panelType} = retrievePanelDetails({
            application: baseApplication,
            recordPanelId,
        });

        expect(panelType).toBe('recordPanels');
        expect(libraryId).toBe('home');
        expect(currentPanel).toEqual({
            id: recordPanelId,
            type: 'custom',
            iframeSource: 'https://fakeurl.aristid.com',
            isSelfContaining: true,
            isStandalone: true,
        });
    });
});
