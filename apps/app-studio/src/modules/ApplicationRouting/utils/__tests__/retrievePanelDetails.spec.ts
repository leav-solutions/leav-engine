import {type Application} from '../../types';
import {getPanelIndex, retrievePanelDetails} from '../retrievePanelDetails';
import {campaignsManagerApplication} from './campaignsManagerApplication.fixture';

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

    it('should locate the panel by its id (creationPanels)', () => {
        const creationPanelId = 'create-simple';
        const baseApplication: Application = {
            ...emptyApplication,
            libraries: {
                ...emptyApplication.libraries,
                home: {
                    ...emptyApplication.libraries.home,
                    creationPanels: [
                        {
                            id: creationPanelId,
                            type: 'creationForm',
                            formId: 'creation',
                            name: {fr: 'Créer'},
                            icon: 'fa-plus',
                            isStandalone: true,
                        },
                    ],
                },
            },
        };

        const {currentPanel, libraryId, panelType, displayedLibraryId} = retrievePanelDetails({
            application: baseApplication,
            recordPanelId: creationPanelId,
        });

        expect(panelType).toBe('creationPanels');
        // A creation panel belongs to (and creates into) its owner library.
        expect(libraryId).toBe('home');
        expect(displayedLibraryId).toBe('home');
        expect(currentPanel?.id).toBe(creationPanelId);
    });

    const makeCustomRecordPanelApp = (panel: Record<string, unknown>): Application => ({
        ...emptyApplication,
        libraries: {
            ...emptyApplication.libraries,
            home: {
                ...emptyApplication.libraries.home,
                recordPanels: [{id: '1', type: 'custom', iframeSource: 'https://fake', ...panel}],
            },
        },
    });

    it('should resolve displayedLibraryId to the static viewLibraryId for a custom panel (precedence)', () => {
        const {displayedLibraryId} = retrievePanelDetails({
            application: makeCustomRecordPanelApp({viewLibraryId: 'campaigns', targetLibraryId: 'map'}),
            recordPanelId: '1',
        });

        // viewLibraryId (static config) wins over the transient runtime targetLibraryId so the displayed
        // library stays stable across the volet open/close lifecycle.
        expect(displayedLibraryId).toBe('campaigns');
    });

    it('should fall back to targetLibraryId for a custom panel without viewLibraryId', () => {
        const {displayedLibraryId} = retrievePanelDetails({
            application: makeCustomRecordPanelApp({targetLibraryId: 'map'}),
            recordPanelId: '1',
        });

        expect(displayedLibraryId).toBe('map');
    });

    it('should fall back to the owner library for a custom panel without viewLibraryId nor targetLibraryId', () => {
        const {displayedLibraryId} = retrievePanelDetails({
            application: makeCustomRecordPanelApp({}),
            recordPanelId: '1',
        });

        expect(displayedLibraryId).toBe('home');
    });
});

/**
 * KPI A (LEAVC-948), read side — the flat `panelId → {currentPanel, libraryId, panelType}` index is
 * built once per `application` reference and reused on every subsequent call (O(1) lookup instead of
 * the O(N panels) `flatMap(...).find(...)` rebuilt on each of the ~10 render call sites). A new
 * `application` reference rebuilds the index; the old one is garbage-collected with it (WeakMap).
 *
 * The memoization is observed through `getPanelIndex`, which exposes the memoized Map. The public
 * `retrievePanelDetails` signature is unchanged — it consumes this index internally.
 */
describe('getPanelIndex — memoized read index (LEAVC-948)', () => {
    it('should return the same index instance for the same application reference (cache hit)', () => {
        const firstIndex = getPanelIndex(campaignsManagerApplication);
        const secondIndex = getPanelIndex(campaignsManagerApplication);

        expect(secondIndex).toBe(firstIndex);
    });

    it('should rebuild the index for a different application reference', () => {
        const otherApplication: Application = {...campaignsManagerApplication};

        const index = getPanelIndex(campaignsManagerApplication);
        const otherIndex = getPanelIndex(otherApplication);

        expect(otherIndex).not.toBe(index);
    });

    it('should index every panel across all libraries by its id', () => {
        const index = getPanelIndex(campaignsManagerApplication);

        // 5 libraries, 18 panels total (4 libraryPanels + 14 recordPanels).
        expect(index.size).toBe(18);
        expect(index.get('campaigns')).toMatchObject({libraryId: 'map', panelType: 'recordPanels'});
        expect(index.get('event-list')).toMatchObject({libraryId: 'events', panelType: 'libraryPanels'});
    });
});

describe('retrievePanelDetails — backed by the memoized index (LEAVC-948)', () => {
    it('should resolve a panel located in the real campaigns_manager config', () => {
        const {currentPanel, libraryId, panelType, displayedLibraryId} = retrievePanelDetails({
            application: campaignsManagerApplication,
            panelId: 'campaigns',
        });

        expect(libraryId).toBe('map');
        expect(panelType).toBe('recordPanels');
        // Record-panel link explorer: it displays the linked `campaigns` library, not its owner `map`.
        expect(displayedLibraryId).toBe('campaigns');
        expect(currentPanel?.id).toBe('campaigns');
    });

    it('should return the same panel object reference as the one stored in the application config', () => {
        const {currentPanel} = retrievePanelDetails({application: campaignsManagerApplication, panelId: 'map-list'});

        expect(currentPanel).toBe(campaignsManagerApplication.libraries.map.libraryPanels[0]);
    });
});
