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
        const {currentPanel, libraryId, panelType} = retrievePanelDetails({
            application: emptyApplication,
            panelId: 'unknown',
        });

        expect(currentPanel).toBeNull();
        expect(libraryId).toBeNull();
        expect(panelType).toBeNull();
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
                            actions: [],
                        },
                    ],
                },
            },
        };

        const {currentPanel, libraryId, panelType} = retrievePanelDetails({
            application: baseApplication,
            panelId,
        });

        expect(panelType).toBe('libraryPanels');
        expect(libraryId).toBe('home');
        expect(currentPanel).toEqual({
            id: panelId,
            type: 'explorer',
            actions: [],
        });
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
