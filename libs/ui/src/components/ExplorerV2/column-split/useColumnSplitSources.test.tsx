import {type MockedResponse} from '@apollo/client/testing';
import {waitFor, renderHook} from '_ui/_tests/testUtils';
import {AttributeType, TreeNodeChildrenDocument} from '_ui/_gqlTypes';
import {type AttributeProperties} from '../_types';
import {COLUMN_SPLIT_UNAVAILABLE} from './_constants';
import {useColumnSplitSources} from './useColumnSplitSources';

const _treeAttribute = (id: string, treeId: string): AttributeProperties =>
    ({
        id,
        type: AttributeType.tree,
        required: false,
        multiple_values: false,
        permissions: {edit_value: true},
        column_split_enabled: true,
        linked_tree: {id: treeId},
    }) as AttributeProperties;

/**
 * A full `TreeNodeChild` node: `MockedProvider` adds `__typename` to the query, so a result missing it
 * cannot be normalized and Apollo drops the whole payload (same constraint as the kanban page mocks in
 * `Explorer.test.tsx`).
 */
const _nodeResult = (id: string, {childrenCount = 0, label = id}: {childrenCount?: number; label?: string} = {}) => ({
    __typename: 'TreeNodeLight',
    id: `node-${id}`,
    order: 0,
    childrenCount,
    record: {
        __typename: 'Record',
        id,
        whoAmI: {
            __typename: 'RecordIdentity',
            id,
            label,
            subLabel: null,
            color: null,
            library: {__typename: 'Library', id: 'statuses', label: 'Statuses'},
            preview: null,
        },
        active: [{__typename: 'Value', value: true}],
    },
    ancestors: [],
    permissions: {__typename: 'TreeNodePermissions', access_tree: true, detach: true, edit_children: true},
});

const _treeMock = (treeId: string, nodes: Array<ReturnType<typeof _nodeResult>>): MockedResponse => ({
    request: {query: TreeNodeChildrenDocument, variables: {treeId, node: null}},
    result: {data: {treeNodeChildren: {__typename: 'TreeNodeLightList', totalCount: nodes.length, list: nodes}}},
});

describe('useColumnSplitSources', () => {
    it('resolves a values-list attribute synchronously, with no query at all', () => {
        const attribute = {
            id: 'status',
            type: AttributeType.simple,
            required: false,
            multiple_values: false,
            permissions: {edit_value: true},
            column_split_enabled: true,
            valuesList: {values: ['draft', 'published']},
        } as AttributeProperties;

        const {result} = renderHook(() => useColumnSplitSources([attribute]));

        expect(result.current.status.options).toEqual([
            {key: 'draft', label: 'draft', rawValue: 'draft'},
            {key: 'published', label: 'published', rawValue: 'published'},
        ]);
        expect(result.current.status.unavailableReasonKey).toBeUndefined();
    });

    it('reports an emptied values list as having nothing to split into', () => {
        const attribute = {
            id: 'status',
            type: AttributeType.simple,
            required: false,
            multiple_values: false,
            permissions: {edit_value: true},
            column_split_enabled: true,
            valuesList: {values: []},
        } as AttributeProperties;

        const {result} = renderHook(() => useColumnSplitSources([attribute]));

        expect(result.current.status).toEqual({
            options: [],
            unavailableReasonKey: COLUMN_SPLIT_UNAVAILABLE.noValues,
        });
    });

    it('resolves a tree attribute to its root nodes, keyed on the node id', async () => {
        const {result} = renderHook(() => useColumnSplitSources([_treeAttribute('status', 'statuses')]), {
            mocks: [_treeMock('statuses', [_nodeResult('draft', {label: 'Draft'}), _nodeResult('published')])],
        });

        // Pending: no reason yet, so the split button stays enabled while the nodes are in flight.
        expect(result.current.status).toEqual({options: []});

        await waitFor(() =>
            expect(result.current.status.options).toEqual([
                {key: 'node-draft', label: 'Draft', color: null, rawValue: 'node-draft'},
                {key: 'node-published', label: 'published', color: null, rawValue: 'node-published'},
            ]),
        );
    });

    it('reports a multi-level tree as unsplittable', async () => {
        const {result} = renderHook(() => useColumnSplitSources([_treeAttribute('status', 'statuses')]), {
            mocks: [_treeMock('statuses', [_nodeResult('draft'), _nodeResult('families', {childrenCount: 4})])],
        });

        await waitFor(() =>
            expect(result.current.status).toEqual({
                options: [],
                unavailableReasonKey: COLUMN_SPLIT_UNAVAILABLE.multiLevelTree,
            }),
        );
    });

    it('shares one fetch between two attributes pointing at the same tree', async () => {
        // A single mocked response for the tree: MockedProvider consumes each mock once, so a second
        // query for the same variables would reject — which is exactly what pins the de-duplication.
        const {result} = renderHook(
            () => useColumnSplitSources([_treeAttribute('status', 'statuses'), _treeAttribute('review', 'statuses')]),
            {mocks: [_treeMock('statuses', [_nodeResult('draft')])]},
        );

        await waitFor(() => expect(result.current.status.options).toHaveLength(1));
        expect(result.current.review.options).toEqual(result.current.status.options);
    });

    it('disables the split when the root nodes cannot be loaded', async () => {
        const {result} = renderHook(() => useColumnSplitSources([_treeAttribute('status', 'statuses')]), {
            mocks: [
                {
                    request: {query: TreeNodeChildrenDocument, variables: {treeId: 'statuses', node: null}},
                    error: new Error('network down'),
                },
            ],
        });

        await waitFor(() =>
            expect(result.current.status).toEqual({
                options: [],
                unavailableReasonKey: COLUMN_SPLIT_UNAVAILABLE.optionsError,
            }),
        );
    });
});
