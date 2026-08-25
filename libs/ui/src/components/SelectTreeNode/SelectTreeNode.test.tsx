import {type MockedResponse} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';
import {TreeDataQueryDocument} from '_ui/_gqlTypes';
import {render, screen, waitFor, within} from '_ui/_tests/testUtils';
import {
    DEFAULT_TREE_SELECTION_DEPTH,
    type ITreeSelectionContentNode,
    treeSelectionContentQuery,
    treeSelectionRootNodeQuery,
} from '_ui/hooks/useTreeSelection/_queries/treeSelectionContentQuery';
import {SelectTreeNode} from './SelectTreeNode';

/**
 * Every node renders its own group buttons — the reveal is a CSS `:hover` on antd's row, which jsdom
 * knows nothing about — so a button has to be looked up inside the row of the node it belongs to.
 */
const _nodeButton = async (label: string, name: RegExp) => {
    const row = (await screen.findByText(label)).closest('.ant-tree-node-content-wrapper') as HTMLElement;

    return within(row).getByRole('button', {name});
};

const treeId = 'categories';

// `__typename` is required: MockedProvider adds it to the documents, the cache drops what lacks it
const _record = (id: string) => ({
    __typename: 'Record',
    id,
    whoAmI: {
        __typename: 'RecordIdentity',
        id,
        label: id,
        library: {__typename: 'Library', id: 'categories'},
    },
});

type MockContentNode = ITreeSelectionContentNode & {__typename: string};

const _node = (id: string, children: MockContentNode[] = []): MockContentNode => ({
    __typename: 'TreeNode',
    id,
    childrenCount: children.length,
    record: _record(id),
    children,
});

const treeContent = [_node('branch', [_node('leaf1'), _node('leaf2')]), _node('otherLeaf')];

const _contentMock = ({
    startAt = null,
    depth = DEFAULT_TREE_SELECTION_DEPTH,
    content = treeContent,
} = {}): MockedResponse => ({
    request: {
        query: treeSelectionContentQuery(depth),
        variables: {
            treeId,
            startAt,
            childrenAsRecordValuePermissionFilter: undefined,
            dependentValuesPermissionFilter: undefined,
        },
    },
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {data: {treeContent: content}},
});

const treeDataMock: MockedResponse = {
    request: {query: TreeDataQueryDocument, variables: {treeId}},
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {
        data: {
            trees: {
                __typename: 'TreesList',
                list: [{__typename: 'Tree', id: treeId, label: {fr: 'Catégories'}}],
            },
        },
    },
};

const defaultMocks = [_contentMock(), treeDataMock];

describe('SelectTreeNode', () => {
    test('Renders the tree content under a pseudo root named after the tree', async () => {
        render(<SelectTreeNode treeId={treeId} onSelect={vi.fn()} />, {mocks: defaultMocks});

        expect(await screen.findByText('Catégories')).toBeVisible();
        expect(screen.getByText('branch')).toBeVisible();
        expect(screen.getByText('otherLeaf')).toBeVisible();
        // Not expanded by default
        expect(screen.queryByText('leaf1')).not.toBeInTheDocument();
    });

    test('Unfolds the whole tree with defaultExpanded', async () => {
        render(<SelectTreeNode treeId={treeId} onSelect={vi.fn()} defaultExpanded />, {mocks: defaultMocks});

        expect(await screen.findByText('leaf1')).toBeVisible();
        expect(screen.getByText('leaf2')).toBeVisible();
    });

    test('Starts at displayRootNode, which becomes the root of the displayed tree', async () => {
        render(<SelectTreeNode treeId={treeId} onSelect={vi.fn()} displayRootNode="branch" />, {
            mocks: [
                _contentMock({startAt: 'branch', content: [_node('leaf1'), _node('leaf2')]}),
                {
                    request: {query: treeSelectionRootNodeQuery, variables: {treeId, nodeId: 'branch'}},
                    result: {data: {getRecordByNodeId: _record('branch')}},
                },
            ],
        });

        expect(await screen.findByText('branch')).toBeVisible();
        expect(screen.getByText('leaf1')).toBeVisible();
        expect(screen.queryByText('Catégories')).not.toBeInTheDocument();
        expect(screen.queryByText('otherLeaf')).not.toBeInTheDocument();
    });

    test('Only fetches the content down to maxDepth', async () => {
        render(<SelectTreeNode treeId={treeId} onSelect={vi.fn()} maxDepth={1} defaultExpanded />, {
            // Only matches if the component asked for a depth of 1
            mocks: [_contentMock({depth: 1, content: [_node('branch'), _node('otherLeaf')]}), treeDataMock],
        });

        expect(await screen.findByText('branch')).toBeVisible();
        expect(screen.queryByText('leaf1')).not.toBeInTheDocument();
    });

    test('Selects a node on click, but not the pseudo root by default', async () => {
        const onSelect = vi.fn();
        render(<SelectTreeNode treeId={treeId} onSelect={onSelect} />, {mocks: defaultMocks});

        await userEvent.click(await screen.findByText('Catégories'));
        expect(onSelect).not.toHaveBeenCalled();

        await userEvent.click(screen.getByText('branch'));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'branch'}), true);
    });

    test('Selects the pseudo root with canSelectRootNode, under the id of the tree', async () => {
        const onSelect = vi.fn();
        render(<SelectTreeNode treeId={treeId} onSelect={onSelect} canSelectRootNode />, {mocks: defaultMocks});

        await userEvent.click(await screen.findByText('Catégories'));

        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({id: treeId, record: null}), true);
    });

    test('Exempts the pseudo root from selectableLibraries, which it belongs to none of', async () => {
        const onSelect = vi.fn();
        render(
            <SelectTreeNode
                treeId={treeId}
                onSelect={onSelect}
                canSelectRootNode
                selectableLibraries={['directories']}
            />,
            {mocks: defaultMocks},
        );

        // The nodes of the tree are records of the `categories` library
        await userEvent.click(await screen.findByText('branch'));
        expect(onSelect).not.toHaveBeenCalled();

        await userEvent.click(screen.getByText('Catégories'));
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({id: treeId}), true);
    });

    test('Keeps the pseudo root unselectable with leaves_only, even with canSelectRootNode', async () => {
        const onSelect = vi.fn();
        render(<SelectTreeNode treeId={treeId} onSelect={onSelect} canSelectRootNode selectableNodes="leaves_only" />, {
            mocks: defaultMocks,
        });

        await userEvent.click(await screen.findByText('Catégories'));

        expect(onSelect).not.toHaveBeenCalled();
    });

    test('Only lets leaves be selected with leaves_only', async () => {
        const onSelect = vi.fn();
        render(<SelectTreeNode treeId={treeId} onSelect={onSelect} selectableNodes="leaves_only" />, {
            mocks: defaultMocks,
        });

        await userEvent.click(await screen.findByText('branch'));
        expect(onSelect).not.toHaveBeenCalled();

        await userEvent.click(screen.getByText('otherLeaf'));
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'otherLeaf'}), true);
    });

    test('Removes the checkbox of unselectable nodes in checkable mode', async () => {
        const onCheck = vi.fn();
        const {container} = render(
            <SelectTreeNode
                treeId={treeId}
                onSelect={vi.fn()}
                onCheck={onCheck}
                checkable
                selectableNodes="leaves_only"
                defaultExpanded
            />,
            {mocks: defaultMocks},
        );

        await screen.findByText('branch');

        // Only the 3 leaves can be checked: neither the pseudo root nor `branch`
        await waitFor(() => expect(container.querySelectorAll('.ant-tree-checkbox')).toHaveLength(3));

        await userEvent.click(screen.getByText('branch'));
        expect(onCheck).not.toHaveBeenCalled();

        await userEvent.click(screen.getByText('leaf1'));
        expect(onCheck).toHaveBeenCalledWith([expect.objectContaining({id: 'leaf1'})]);
    });

    test('Selects every direct child with showSelectChildrenButton', async () => {
        const onSelect = vi.fn();
        render(<SelectTreeNode treeId={treeId} onSelect={onSelect} showSelectChildrenButton defaultExpanded />, {
            mocks: defaultMocks,
        });

        await userEvent.click(await _nodeButton('branch', /select_children/));

        expect(onSelect).toHaveBeenCalledTimes(2);
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'leaf1'}), true);
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'leaf2'}), true);
    });

    test('Selects every descendant with showSelectDescendantsButton', async () => {
        const onSelect = vi.fn();
        render(<SelectTreeNode treeId={treeId} onSelect={onSelect} showSelectDescendantsButton defaultExpanded />, {
            mocks: defaultMocks,
        });

        await userEvent.click(await _nodeButton('Catégories', /select_descendants/));

        // The whole tree, the pseudo root excluded since it cannot be selected
        expect(onSelect.mock.calls.map(([node]) => node.id)).toEqual(['branch', 'leaf1', 'leaf2', 'otherLeaf']);
    });

    test('Does not show the group selection buttons by default', async () => {
        render(<SelectTreeNode treeId={treeId} onSelect={vi.fn()} defaultExpanded />, {mocks: defaultMocks});

        expect(await screen.findByText('branch')).toBeVisible();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
