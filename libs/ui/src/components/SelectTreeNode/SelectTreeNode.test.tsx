import userEvent from '@testing-library/user-event';
import * as apolloClient from '@apollo/client';
import * as gqlTypes from '_ui/_gqlTypes';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {SelectTreeNode} from './SelectTreeNode';

// `behavior` is fetched by `treeContentDataQuery`, a document built at runtime and thus ignored by
// graphql-codegen: the generated type has to be widened by hand, here as in `SelectTreeNodeContent`.
type MockTreeContentNode = Omit<gqlTypes.TreeContentDataQueryQuery['treeContent'][number], 'record'> & {
    record: gqlTypes.TreeContentDataQueryQuery['treeContent'][number]['record'] & {
        whoAmI: {library: {behavior: gqlTypes.LibraryBehavior}};
    };
    children?: MockTreeContentNode[];
};

const mockTreeContent: MockTreeContentNode[] = [
    {
        id: 'id1',
        record: {
            id: 'id1',
            whoAmI: {
                id: 'id1',
                label: 'label1',
                library: {
                    id: 'directories',
                    behavior: gqlTypes.LibraryBehavior.directories,
                },
            },
        },
        childrenCount: 1,
        children: [
            {
                id: 'id2',
                record: {
                    id: 'id2',
                    whoAmI: {
                        id: 'id2',
                        label: 'label2',
                        library: {
                            id: 'directories',
                            behavior: gqlTypes.LibraryBehavior.directories,
                        },
                    },
                },
                childrenCount: 0,
            },
            {
                id: 'id3',
                record: {
                    id: 'id3',
                    whoAmI: {
                        id: 'id3',
                        label: 'blue.png',
                        library: {
                            id: 'files',
                            behavior: gqlTypes.LibraryBehavior.files,
                        },
                    },
                },
                childrenCount: 0,
            },
        ],
    },
];

const _mockQueries = () => {
    vi.spyOn(gqlTypes, 'useTreeDataQueryQuery').mockReturnValue({
        data: {
            trees: {
                list: [{id: 'treeId', label: {fr: 'Tree Label'}}],
            },
        },
        called: true,
        loading: false,
        error: null,
    } as gqlTypes.TreeDataQueryQueryHookResult);

    vi.spyOn(apolloClient, 'useLazyQuery').mockReturnValue([
        vi.fn().mockResolvedValue({
            data: {
                treeContent: mockTreeContent,
            },
        }),
        {} as apolloClient.QueryResult,
    ] as unknown as ReturnType<typeof apolloClient.useLazyQuery>);
};

describe('SelectTreeNode', () => {
    beforeEach(() => {
        _mockQueries();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('Render tree and navigate', async () => {
        render(<SelectTreeNode treeId="treeId" onSelect={vi.fn()} />);

        await waitFor(() => screen.getByText('Tree Label'));
        expect(screen.getByText('Tree Label')).toBeInTheDocument();

        // First level loaded
        expect(await screen.findByText('label1')).toBeInTheDocument();

        // Expand node => fetch children
        await userEvent.click(screen.getByRole('img', {name: 'Ouvrir'}));
        await waitFor(() => expect(screen.getByText('label2')).toBeInTheDocument());
    });

    test('Should disable nodes from a non selectable library', async () => {
        render(<SelectTreeNode treeId="treeId" onSelect={vi.fn()} selectableLibraries={['directories']} />);

        await userEvent.click(await screen.findByRole('img', {name: 'Ouvrir'}));

        expect(await screen.findByRole('treeitem', {name: 'blue.png'})).toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('treeitem', {name: 'label2'})).not.toHaveAttribute('aria-disabled', 'true');
    });

    test('Should not select a node from a non selectable library', async () => {
        const onSelect = vi.fn();
        render(<SelectTreeNode treeId="treeId" onSelect={onSelect} selectableLibraries={['directories']} />);

        await userEvent.click(await screen.findByRole('img', {name: 'Ouvrir'}));

        await userEvent.click(screen.getByText('blue.png'));
        expect(onSelect).not.toHaveBeenCalled();

        await userEvent.click(screen.getByText('label2'));
        expect(onSelect).toHaveBeenCalled();
    });

    test('Should display a type icon on each node when asked to', async () => {
        const {container} = render(<SelectTreeNode treeId="treeId" onSelect={vi.fn()} showNodeTypeIcon />);

        await userEvent.click(await screen.findByRole('img', {name: 'Ouvrir'}));
        await screen.findByText('blue.png');

        expect(container.querySelectorAll('[data-icon="folder"]')).toHaveLength(2);
        expect(container.querySelectorAll('[data-icon="file-image"]')).toHaveLength(1);
    });

    test('Should not display any type icon by default', async () => {
        const {container} = render(<SelectTreeNode treeId="treeId" onSelect={vi.fn()} />);

        await screen.findByText('label1');

        expect(container.querySelector('[data-icon="folder"]')).not.toBeInTheDocument();
    });
});
