import {render} from '_ui/_tests/testUtils';
import {type Application} from '../../../types';
import {PanelLibraryExplorer} from '../PanelLibraryExplorer';

const {mockExplorerV1, mockExplorerV2} = vi.hoisted(() => ({
    mockExplorerV1: vi.fn(),
    mockExplorerV2: vi.fn(),
}));

vi.mock('@leav/ui', async () => ({
    ...(await vi.importActual('@leav/ui')),
    Explorer: (props: unknown) => {
        mockExplorerV1(props);
        return <div>explorer-v1</div>;
    },
    ExplorerV2: (props: unknown) => {
        mockExplorerV2(props);
        return <div>explorer-v2</div>;
    },
    useLang: () => ({lang: ['fr']}),
}));

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: () => vi.fn(),
}));

vi.mock('../useViewSettingsProps', () => ({
    useViewSettingsProps: () => ({currentView: undefined, defaultCallbacks: undefined}),
}));

vi.mock('../../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

import {useApplicationSettingsContext} from '../../../../../config/application-instance/application-settings/useApplicationSettingsContext';

describe('PanelLibraryExplorer — creationPanels wiring', () => {
    const makeApplication = ({
        enableViewSettings,
        creationPanels,
    }: {
        enableViewSettings: boolean;
        creationPanels?: Application['libraries'][string]['creationPanels'];
    }): Application => ({
        workspaces: [
            {
                id: '1',
                title: {fr: 'Test'},
                type: 'library',
                libraryId: 'home',
            },
        ],
        libraries: {
            home: {
                libraryPanels: [],
                recordPanels: [],
                ...(creationPanels === undefined ? {} : {creationPanels}),
            },
        },
        enableViewSettings,
    });

    const twoCreationPanels: NonNullable<Application['libraries'][string]['creationPanels']> = [
        {
            id: 'create-simple',
            type: 'creationForm',
            formId: 'creation',
            name: {fr: 'Créer'},
            icon: 'fa-plus',
            isStandalone: true,
        },
        {
            id: 'create-from-model',
            type: 'creationForm',
            formId: 'creation_model',
            name: {fr: 'Depuis un modèle'},
            icon: 'fa-copy',
            isStandalone: true,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('replaces the built-in create with the configured creation actions (ExplorerV2)', () => {
        vi.mocked(useApplicationSettingsContext).mockReturnValue([
            makeApplication({enableViewSettings: true, creationPanels: twoCreationPanels}),
        ] as any);

        render(
            <PanelLibraryExplorer libraryId="home" explorerProps={{defaultPrimaryActions: ['create']}} actions={[]} />,
        );

        const explorerProps = mockExplorerV2.mock.calls[0][0];
        expect(explorerProps.primaryActions).toHaveLength(2);
        expect(explorerProps.primaryActions.map((action: {label: string}) => action.label)).toEqual([
            'Créer',
            'Depuis un modèle',
        ]);
        // The built-in create is disabled even though the explorerProps config asked for it.
        expect(explorerProps.defaultPrimaryActions).toEqual([]);
    });

    it('keeps the built-in create untouched when no creationPanel is declared (ExplorerV2)', () => {
        vi.mocked(useApplicationSettingsContext).mockReturnValue([makeApplication({enableViewSettings: true})] as any);

        render(
            <PanelLibraryExplorer libraryId="home" explorerProps={{defaultPrimaryActions: ['create']}} actions={[]} />,
        );

        const explorerProps = mockExplorerV2.mock.calls[0][0];
        expect(explorerProps.primaryActions).toBeUndefined();
        expect(explorerProps.defaultPrimaryActions).toEqual(['create']);
    });

    it('wires creationPanels the same way when view settings are disabled (Explorer v1)', () => {
        vi.mocked(useApplicationSettingsContext).mockReturnValue([
            makeApplication({enableViewSettings: false, creationPanels: twoCreationPanels}),
        ] as any);

        render(<PanelLibraryExplorer libraryId="home" explorerProps={undefined} actions={[]} />);

        expect(mockExplorerV2).not.toHaveBeenCalled();
        const explorerProps = mockExplorerV1.mock.calls[0][0];
        expect(explorerProps.primaryActions).toHaveLength(2);
        expect(explorerProps.primaryActions.map((action: {label: string}) => action.label)).toEqual([
            'Créer',
            'Depuis un modèle',
        ]);
        expect(explorerProps.defaultPrimaryActions).toEqual([]);
    });
});
