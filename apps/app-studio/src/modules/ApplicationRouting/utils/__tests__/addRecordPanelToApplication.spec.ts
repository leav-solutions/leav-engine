import {type Panel} from '_ui/hooks/useIFrameMessenger/types';
import {type Application} from '../../types';
import {addRecordPanelToApplication} from '../addRecordPanelToApplication';

describe('addRecordPanelToApplication method', () => {
    const mockPanel: Panel = {id: 'newPanelId', name: {fr: 'New Panel'}, type: 'explorer', actions: []};
    const emptyApplication: Application = {
        workspaces: [
            {
                id: '1',
                title: {
                    fr: 'un',
                    en: 'one',
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

    it('should add panel to existing recordPanel list library', () => {
        const newApplication = addRecordPanelToApplication(mockPanel, emptyApplication, {
            libraryId: 'home',
        });

        expect(newApplication.libraries.home.recordPanels).toEqual([mockPanel]);
    });

    it('should create and insert panel structure on new library', () => {
        const newApplication = addRecordPanelToApplication(mockPanel, emptyApplication, {
            libraryId: 'unknown',
        });

        expect(newApplication.libraries.unknown.recordPanels).toEqual([mockPanel]);
    });

    it('should replace panel into existing recordPanel list library', () => {
        const baseApplication: Application = {
            ...emptyApplication,
            libraries: {
                ...emptyApplication.libraries,
                home: {...emptyApplication.libraries.home, recordPanels: [mockPanel]},
            },
        };
        const newPanel: Panel = {
            id: mockPanel.id,
            isStandalone: true,
            type: 'custom',
            iframeSource: 'https://fakeurl.aristid.com',
        };
        const newApplication = addRecordPanelToApplication(newPanel, baseApplication, {
            libraryId: 'home',
        });

        expect(newApplication.libraries.home.recordPanels).toEqual([newPanel]);
    });
});
