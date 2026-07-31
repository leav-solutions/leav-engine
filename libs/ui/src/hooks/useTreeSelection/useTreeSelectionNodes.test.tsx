import {type MockedResponse} from '@apollo/client/testing';
import {vi} from 'vitest';
import {TreeDataQueryDocument} from '_ui/_gqlTypes';
import {renderHook, waitFor} from '_ui/_tests/testUtils';
import {type IResolvedTreeSelectionConf} from './_types';
import {
    DEFAULT_TREE_SELECTION_DEPTH,
    type ITreeSelectionContentNode,
    treeSelectionContentQuery,
    treeSelectionRootNodeQuery,
} from './_queries/treeSelectionContentQuery';
import {TREE_SELECTION_DEFAULTS} from './resolveTreeSelectionConf';
import {useTreeSelectionNodes} from './useTreeSelectionNodes';

const treeId = 'categories';

// `__typename` is required: MockedProvider adds it to the documents, the cache drops what lacks it
const _record = (id: string) => ({
    __typename: 'Record',
    id,
    whoAmI: {
        __typename: 'RecordIdentity',
        id,
        label: `label ${id}`,
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

const _contentMock = (
    {startAt = null, depth = DEFAULT_TREE_SELECTION_DEPTH, content = treeContent} = {},
    onCalled?: () => void,
): MockedResponse => ({
    request: {
        query: treeSelectionContentQuery(depth),
        variables: {
            treeId,
            startAt,
            childrenAsRecordValuePermissionFilter: undefined,
            dependentValuesPermissionFilter: undefined,
        },
    },
    result: () => {
        onCalled?.();
        return {data: {treeContent: content}};
    },
});

const treeDataMock: MockedResponse = {
    request: {query: TreeDataQueryDocument, variables: {treeId}},
    result: {
        data: {
            trees: {
                __typename: 'TreesList',
                list: [{__typename: 'Tree', id: treeId, label: {fr: 'Catégories'}}],
            },
        },
    },
};

const rootNodeMock: MockedResponse = {
    request: {query: treeSelectionRootNodeQuery, variables: {treeId, nodeId: 'branch'}},
    result: {data: {getRecordByNodeId: _record('branch')}},
};

const _renderHook = (conf: Partial<IResolvedTreeSelectionConf> = {}, mocks: readonly MockedResponse[] = []) =>
    renderHook(() => useTreeSelectionNodes({treeId, conf: {...TREE_SELECTION_DEFAULTS, ...conf}}), {mocks});

describe('useTreeSelectionNodes', () => {
    test('Builds a pseudo root from the tree label, holding the whole content', async () => {
        const {result} = _renderHook({}, [_contentMock(), treeDataMock]);

        await waitFor(() => expect(result.current.loading).toBe(false));

        const {rootNode, nodesById} = result.current;

        expect(rootNode).toMatchObject({
            id: treeId,
            key: treeId,
            title: 'Catégories',
            record: null,
            parents: [],
            // The pseudo root stands for the tree, there is no value to store for it
            selectable: false,
            checkable: false,
        });
        expect(rootNode.children.map(node => node.id)).toEqual(['branch', 'otherLeaf']);
        expect(Object.keys(nodesById).sort()).toEqual(['branch', 'categories', 'leaf1', 'leaf2', 'otherLeaf']);
        expect(nodesById.leaf1).toMatchObject({
            title: 'label leaf1',
            isLeaf: true,
            // From the closest parent to the root
            parents: ['branch', treeId],
            disabled: false,
            selectable: true,
            checkable: true,
        });
        expect(nodesById.branch.isLeaf).toBe(false);
    });

    test('Returns every descendant of a node, itself excluded', async () => {
        const {result} = _renderHook({}, [_contentMock(), treeDataMock]);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.getDescendants(treeId)).toEqual(['branch', 'leaf1', 'leaf2', 'otherLeaf']);
        expect(result.current.getDescendants('branch')).toEqual(['leaf1', 'leaf2']);
        expect(result.current.getDescendants('leaf1')).toEqual([]);
        expect(result.current.getDescendants('unknown')).toEqual([]);
    });

    test('Makes intermediate nodes unselectable with leaves_only', async () => {
        const {result} = _renderHook({selectableNodes: 'leaves_only'}, [_contentMock(), treeDataMock]);

        await waitFor(() => expect(result.current.loading).toBe(false));

        const {nodesById} = result.current;

        expect(nodesById.branch).toMatchObject({selectable: false, checkable: false});
        expect(nodesById.leaf1).toMatchObject({selectable: true, checkable: true});
        expect(nodesById.otherLeaf).toMatchObject({selectable: true, checkable: true});
    });

    test('Marks the disabled nodes as such and prevents their selection', async () => {
        const {result} = renderHook(
            () =>
                useTreeSelectionNodes({
                    treeId,
                    conf: TREE_SELECTION_DEFAULTS,
                    disabledNodes: ['leaf1'],
                }),
            {mocks: [_contentMock(), treeDataMock]},
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.nodesById.leaf1).toMatchObject({disabled: true, selectable: false, checkable: false});
        expect(result.current.nodesById.leaf2).toMatchObject({disabled: false, selectable: true});
    });

    test('Starts at displayRootNode, which becomes the pseudo root', async () => {
        const {result} = _renderHook({displayRootNode: 'branch'}, [
            _contentMock({startAt: 'branch', content: [_node('leaf1'), _node('leaf2')]}),
            rootNodeMock,
        ]);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.rootNode).toMatchObject({
            id: 'branch',
            title: 'label branch',
            parents: [],
            // A real node this time: it follows the selection rules
            selectable: true,
        });
        expect(result.current.rootNode.children.map(node => node.id)).toEqual(['leaf1', 'leaf2']);
        expect(result.current.nodesById.leaf1.parents).toEqual(['branch']);
    });

    test('Fetches the content at the configured depth', async () => {
        const {result} = _renderHook({maxDepth: 2}, [
            // Only matches if the hook built its document with a depth of 2
            _contentMock({depth: 2, content: [_node('branch', [_node('leaf1')])]}),
            treeDataMock,
        ]);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.rootNode.children[0].children.map(node => node.id)).toEqual(['leaf1']);
    });

    test('Handles an empty tree', async () => {
        const {result} = _renderHook({}, [_contentMock({content: []}), treeDataMock]);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.rootNode.children).toEqual([]);
        expect(result.current.getDescendants(treeId)).toEqual([]);
    });

    test('Memoizes its query document, so a rerender does not trigger a new request', async () => {
        const onContentCalled = vi.fn();
        const {result, rerender} = renderHook(
            () => useTreeSelectionNodes({treeId, conf: TREE_SELECTION_DEFAULTS, disabledNodes: ['leaf1']}),
            {mocks: [_contentMock({}, onContentCalled), treeDataMock]},
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        rerender();
        rerender();

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(onContentCalled).toHaveBeenCalledTimes(1);
    });

    test('Requests nothing while skipped, for a caller loading the tree on demand', async () => {
        const onContentCalled = vi.fn();
        const {result, rerender} = renderHook(
            ({skip}: {skip: boolean}) => useTreeSelectionNodes({treeId, conf: TREE_SELECTION_DEFAULTS, skip}),
            {mocks: [_contentMock({}, onContentCalled), treeDataMock], initialProps: {skip: true}},
        );

        expect(result.current.loading).toBe(false);
        expect(result.current.rootNode).toBe(null);
        expect(result.current.nodesById).toEqual({});
        expect(onContentCalled).not.toHaveBeenCalled();

        rerender({skip: false});

        await waitFor(() => expect(result.current.rootNode).not.toBe(null));
        expect(onContentCalled).toHaveBeenCalledTimes(1);
    });

    test('Surfaces the loading and error states', async () => {
        const {result} = _renderHook({}, [treeDataMock]);

        expect(result.current.loading).toBe(true);
        expect(result.current.rootNode).toBe(null);

        await waitFor(() => expect(result.current.error).toBeDefined());
        expect(result.current.rootNode).toBe(null);
    });
});
