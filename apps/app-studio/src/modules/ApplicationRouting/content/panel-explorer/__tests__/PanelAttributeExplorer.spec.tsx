import {render} from '_ui/_tests/testUtils';
import {type Application} from '../../../types';
import {PanelAttributeExplorer} from '../PanelAttributeExplorer';

const {mockExplorerV1, mockExplorerV2, mockNavigate} = vi.hoisted(() => ({
    mockExplorerV1: vi.fn(),
    mockExplorerV2: vi.fn(),
    mockNavigate: vi.fn(),
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
    useConfirmModal: () => ({openConfirmModal: vi.fn()}),
    useExecuteSaveValueBatchMutation: () => ({saveValues: vi.fn()}),
    useValuesCacheUpdate: () => vi.fn(),
}));

vi.mock('_ui/_gqlTypes', async () => ({
    ...(await vi.importActual('_ui/_gqlTypes')),
    useDeleteValueMutation: () => [vi.fn()],
    useDeactivateRecordsMutation: () => [vi.fn()],
}));

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: () => mockNavigate,
}));

vi.mock('../useViewSettingsProps', () => ({
    useViewSettingsProps: () => ({currentView: undefined, defaultCallbacks: undefined}),
}));

vi.mock('../../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

import {useApplicationSettingsContext} from '../../../../../config/application-instance/application-settings/useApplicationSettingsContext';

describe('PanelAttributeExplorer — creationPanels wiring', () => {
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
                type: 'record',
                recordId: '42',
                libraryId: 'campaigns',
            },
        ],
        libraries: {
            offers: {
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
            name: {fr: 'Créer une UB'},
            icon: 'fa-plus',
            isStandalone: true,
        },
        {
            id: 'create-bulk',
            type: 'customCreation',
            iframeSource: 'https://bulk.example',
            name: {fr: 'Créer des UB en masse'},
            icon: 'fa-plus',
            isStandalone: true,
        },
    ];

    const renderPanel = () =>
        render(
            <PanelAttributeExplorer
                libraryIdSource="offers"
                attributeSource="offers_campaign"
                deactivateOnUnlink={false}
                explorerProps={{defaultPrimaryActions: ['create']}}
                actions={[]}
                recordId="42"
                libraryId="campaigns"
            />,
        );

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('replaces the built-in create with the configured creation actions (ExplorerV2)', () => {
        vi.mocked(useApplicationSettingsContext).mockReturnValue([
            makeApplication({enableViewSettings: true, creationPanels: twoCreationPanels}),
        ] as any);

        renderPanel();

        const explorerProps = mockExplorerV2.mock.calls[0][0];
        expect(explorerProps.primaryActions.map((action: {label: string}) => action.label)).toEqual([
            'Créer une UB',
            'Créer des UB en masse',
        ]);
        // The built-in create is disabled even though the explorerProps config asked for it.
        expect(explorerProps.defaultPrimaryActions).toEqual([]);
    });

    it('forwards the link context so the record is created already attached to the parent', () => {
        vi.mocked(useApplicationSettingsContext).mockReturnValue([
            makeApplication({enableViewSettings: true, creationPanels: twoCreationPanels}),
        ] as any);

        renderPanel();

        mockExplorerV2.mock.calls[0][0].primaryActions[1].callback();

        expect(mockNavigate).toHaveBeenCalledWith(
            `newRecord/popup/create-bulk?formInitialValues=${encodeURIComponent(
                JSON.stringify({offers_campaign: ['42']}),
            )}`,
        );
    });

    it('keeps the built-in create untouched when no creationPanel is declared (ExplorerV2)', () => {
        vi.mocked(useApplicationSettingsContext).mockReturnValue([makeApplication({enableViewSettings: true})] as any);

        renderPanel();

        const explorerProps = mockExplorerV2.mock.calls[0][0];
        expect(explorerProps.primaryActions).toBeUndefined();
        expect(explorerProps.defaultPrimaryActions).toEqual(['create']);
    });

    it('wires creationPanels the same way when view settings are disabled (Explorer v1)', () => {
        vi.mocked(useApplicationSettingsContext).mockReturnValue([
            makeApplication({enableViewSettings: false, creationPanels: twoCreationPanels}),
        ] as any);

        renderPanel();

        expect(mockExplorerV2).not.toHaveBeenCalled();
        const explorerProps = mockExplorerV1.mock.calls[0][0];
        expect(explorerProps.primaryActions).toHaveLength(2);
        expect(explorerProps.defaultPrimaryActions).toEqual([]);
    });
});
