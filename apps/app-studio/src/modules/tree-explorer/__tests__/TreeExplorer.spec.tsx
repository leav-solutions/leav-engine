import {render, screen} from '_ui/_tests/testUtils';
import * as generated from '../../../__generated__';
import {TreeExplorer} from '../TreeExplorer';

jest.mock('@leav/ui', () => ({
    ...jest.requireActual('@leav/ui'),
    useGetRecordUpdatesSubscription: jest.fn(),
}));

jest.mock('../NavigationView', () => ({
    NavigationView: () => <div>navigation-view</div>,
}));

describe('TreeExplorer', () => {
    const spyUseGetTree = jest.spyOn(generated, 'useGetTreeForExplorerQuery');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const buildTreeResult = (accessTree: boolean) =>
        ({
            data: {
                trees: {
                    list: [
                        {
                            id: 'my_tree',
                            label: 'My tree',
                            behavior: 'standard',
                            libraries: [],
                            permissions: {access_tree: accessTree, edit_children: true},
                        },
                    ],
                },
            },
            loading: false,
            error: undefined,
        }) as unknown as ReturnType<typeof generated.useGetTreeForExplorerQuery>;

    it('renders the navigation view when the user can access the tree', () => {
        spyUseGetTree.mockReturnValue(buildTreeResult(true));

        render(<TreeExplorer treeId="my_tree" />);

        expect(screen.getByText('navigation-view')).toBeInTheDocument();
    });

    it('does not render the navigation view when access is denied', () => {
        spyUseGetTree.mockReturnValue(buildTreeResult(false));

        render(<TreeExplorer treeId="my_tree" />);

        expect(screen.queryByText('navigation-view')).not.toBeInTheDocument();
    });
});
