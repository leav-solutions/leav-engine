import {type MockedResponse} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';
import {TreeDataQueryDocument} from '_ui/_gqlTypes';
import {render, screen, within} from '_ui/_tests/testUtils';
import {
    DEFAULT_TREE_SELECTION_DEPTH,
    type ITreeSelectionContentNode,
    treeSelectionContentQuery,
} from '_ui/hooks/useTreeSelection/_queries/treeSelectionContentQuery';
import {SelectTreeNodeModalV2, type SelectTreeNodeModalV2Attribute} from './SelectTreeNodeModalV2';

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

const contentMock: MockedResponse = {
    request: {
        query: treeSelectionContentQuery(DEFAULT_TREE_SELECTION_DEPTH),
        variables: {
            treeId,
            startAt: null,
            childrenAsRecordValuePermissionFilter: undefined,
            dependentValuesPermissionFilter: undefined,
        },
    },
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {data: {treeContent: [_node('branch', [_node('leaf1')]), _node('otherLeaf')]}},
};

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

const mocks = [contentMock, treeDataMock];

const _attribute = (
    treeSelectionConf: SelectTreeNodeModalV2Attribute['tree_selection_conf'] = null,
    multipleValues = false,
): SelectTreeNodeModalV2Attribute => ({
    multiple_values: multipleValues,
    linked_tree: {id: treeId},
    tree_selection_conf: treeSelectionConf,
});

const _renderModal = (props: Partial<Parameters<typeof SelectTreeNodeModalV2>[0]> = {}) =>
    render(
        <SelectTreeNodeModalV2
            open
            title="Ajouter une catégorie"
            attribute={_attribute()}
            backendValues={[]}
            onConfirm={vi.fn()}
            onClose={vi.fn()}
            {...props}
        />,
        {mocks},
    );

describe('SelectTreeNodeModalV2', () => {
    test('Applies the system defaults without configuration nor prop', async () => {
        _renderModal();

        expect(await screen.findByText('Catégories')).toBeVisible();
        // Not expanded, no group selection button, every node selectable
        expect(screen.queryByText('leaf1')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /select_children/})).not.toBeInTheDocument();
    });

    test('Follows the configuration of the attribute', async () => {
        _renderModal({attribute: _attribute({defaultExpanded: true, showSelectChildrenButton: true})});

        expect(await screen.findByText('leaf1')).toBeVisible();

        // Every node renders its own buttons: the reveal is a CSS `:hover` on antd's row
        const branchRow = screen.getByText('branch').closest('.ant-tree-node-content-wrapper') as HTMLElement;
        expect(within(branchRow).getByRole('button', {name: /select_children/})).toBeVisible();
    });

    test('Lets the calling props win over the configuration of the attribute', async () => {
        _renderModal({
            attribute: _attribute({defaultExpanded: true, selectableNodes: 'all_nodes'}),
            defaultExpanded: false,
            selectableNodes: 'leaves_only',
        });

        expect(await screen.findByText('branch')).toBeVisible();
        expect(screen.queryByText('leaf1')).not.toBeInTheDocument();
    });

    test('Lets a leaves_only prop win over an all_nodes attribute', async () => {
        const onConfirm = vi.fn();
        _renderModal({
            attribute: _attribute({selectableNodes: 'all_nodes'}),
            selectableNodes: 'leaves_only',
            onConfirm,
        });

        await userEvent.click(await screen.findByText('branch'));
        expect(onConfirm).not.toHaveBeenCalled();

        await userEvent.click(screen.getByText('otherLeaf'));
        expect(onConfirm).toHaveBeenCalledWith([expect.objectContaining({id: 'otherLeaf'})]);
    });

    test('Confirms and closes right away on a mono-valued attribute', async () => {
        const onConfirm = vi.fn();
        const onClose = vi.fn();
        _renderModal({onConfirm, onClose});

        await userEvent.click(await screen.findByText('branch'));

        expect(onConfirm).toHaveBeenCalledWith([expect.objectContaining({id: 'branch'})]);
        expect(onClose).toHaveBeenCalled();
    });

    test('Waits for a confirmation on a multi-valued attribute', async () => {
        const onConfirm = vi.fn();
        _renderModal({attribute: _attribute(null, true), onConfirm});

        await userEvent.click(await screen.findByText('branch'));
        expect(onConfirm).not.toHaveBeenCalled();

        await userEvent.click(screen.getByText('otherLeaf'));
        await userEvent.click(screen.getByRole('button', {name: /global.confirm/}));

        expect(onConfirm).toHaveBeenCalledWith([
            expect.objectContaining({id: 'branch'}),
            expect.objectContaining({id: 'otherLeaf'}),
        ]);
    });

    test('Disables the values already linked to the record, and only them', async () => {
        const onConfirm = vi.fn();
        _renderModal({
            attribute: _attribute(null, true),
            backendValues: [{treeValue: {id: 'otherLeaf'}}],
            onConfirm,
        });

        await userEvent.click(await screen.findByText('otherLeaf'));
        expect(onConfirm).not.toHaveBeenCalled();

        // The root of the tree is no longer force-disabled, it is simply not a selectable node
        await userEvent.click(screen.getByText('Catégories'));
        expect(onConfirm).not.toHaveBeenCalled();

        await userEvent.click(screen.getByText('branch'));
        await userEvent.click(screen.getByRole('button', {name: /global.confirm/}));
        expect(onConfirm).toHaveBeenCalledWith([expect.objectContaining({id: 'branch'})]);
    });
});
