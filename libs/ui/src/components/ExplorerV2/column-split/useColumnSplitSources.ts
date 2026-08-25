import {useApolloClient} from '@apollo/client';
import {useEffect, useRef, useState} from 'react';
import {
    AttributeType,
    TreeNodeChildrenDocument,
    type TreeNodeChildrenQuery,
    type TreeNodeChildrenQueryVariables,
} from '_ui/_gqlTypes';
import {type AttributeProperties} from '../_types';
import {COLUMN_SPLIT_UNAVAILABLE} from './_constants';
import {type IColumnSplitSource} from './_types';
import {getColumnSplitOptions} from './getColumnSplitOptions';
import {mapTreeNodesToSplitSource} from './mapTreeNodesToSplitSource';

export type ColumnSplitSourcesById = Record<string, IColumnSplitSource>;

/** Root nodes still in flight: no reason yet, so the split button stays enabled — they land in
 *  milliseconds and the group appears on its own, the column just renders plain until then. */
const TREE_SOURCE_PENDING: IColumnSplitSource = {options: []};
const TREE_SOURCE_ERROR: IColumnSplitSource = {
    options: [],
    unavailableReasonKey: COLUMN_SPLIT_UNAVAILABLE.optionsError,
};

/**
 * Identity cache of the values-list sources, keyed on the attribute OBJECT — stable across renders,
 * `useExplorerLibraryMetadata` memoizes it, and fresh metadata means a new object hence a recompute.
 *
 * Not a micro-optimisation: recomputing them handed a brand new `option` object to every sub-column
 * header and every cell on every render, which made memoizing anything downstream pointless (see
 * `ColumnSplitValueHeader`). Module-level rather than a ref, since the mapping is pure.
 */
const _valuesListSourceCache = new WeakMap<AttributeProperties, IColumnSplitSource>();

const _getValuesListSource = (attribute: AttributeProperties): IColumnSplitSource => {
    const cached = _valuesListSourceCache.get(attribute);
    if (cached) {
        return cached;
    }

    const options = getColumnSplitOptions(attribute);
    const source: IColumnSplitSource =
        options.length > 0 ? {options} : {options, unavailableReasonKey: COLUMN_SPLIT_UNAVAILABLE.noValues};

    _valuesListSourceCache.set(attribute, source);
    return source;
};

const _getSplitTreeId = (attribute: AttributeProperties): string | null =>
    attribute.type === AttributeType.tree && 'linked_tree' in attribute ? (attribute.linked_tree?.id ?? null) : null;

/**
 * Resolves, for each of the given splittable attributes, its sub-columns — or why it has none. Two
 * sources, deliberately behind one entry point so `TableView` never has to know which is which:
 *
 * - **closed values list** (standard / link): already carried by the library metadata query, so
 *   `getColumnSplitOptions` reads it synchronously (LEAVC-1073);
 * - **tree** (LEAVC-1074): the linked tree's ROOT nodes, which the metadata query does not carry — one
 *   `TREE_NODE_CHILDREN` query per distinct tree, keyed by tree id so two attributes pointing at the same
 *   tree share a single fetch (and, `cache-first`, the very cache entry the kanban axis query fills).
 *
 * ⚠️ Fanned out with `apolloClient.query` rather than the generated hook, like `useKanbanColumnsData`
 * does for its column pages: the attribute list is variable-length, so calling a query hook once per
 * tree would break the rules of hooks. Do NOT work around that with a bridge component per split column
 * lifting its hook's result back up: the imperative fan-out is the pattern here.
 *
 * Trees are queried for every splittable tree column **displayed**, not only the ones actually split: the
 * flatness of a tree is only knowable from its nodes, and the split button has to be disabled (with its
 * explanatory tooltip) *before* the user clicks it, not after a click that visibly did nothing.
 */
export const useColumnSplitSources = (splittableAttributes: AttributeProperties[]): ColumnSplitSourcesById => {
    const apolloClient = useApolloClient();
    const [treeSourcesByTreeId, setTreeSourcesByTreeId] = useState<ColumnSplitSourcesById>({});
    const requestedTreeIdsRef = useRef<Set<string>>(new Set());

    const treeIdByAttributeId: Record<string, string> = {};
    splittableAttributes.forEach(attribute => {
        const treeId = _getSplitTreeId(attribute);
        if (treeId) {
            treeIdByAttributeId[attribute.id] = treeId;
        }
    });

    // Joined into a string so the effect depends on the tree ids THEMSELVES and not on the identity of a
    // list rebuilt on every render of `TableView` (a comma is a safe separator: a tree id is an identifier).
    const treeIdsSignature = [...new Set(Object.values(treeIdByAttributeId))].sort().join(',');

    useEffect(() => {
        treeIdsSignature
            .split(',')
            .filter(Boolean)
            .forEach(treeId => {
                if (requestedTreeIdsRef.current.has(treeId)) {
                    return;
                }
                requestedTreeIdsRef.current.add(treeId);

                apolloClient
                    .query<TreeNodeChildrenQuery, TreeNodeChildrenQueryVariables>({
                        query: TreeNodeChildrenDocument,
                        // A tree's shape is structure, not record data: no reason to go to the network
                        // again for a column the user splits and collapses repeatedly.
                        fetchPolicy: 'cache-first',
                        variables: {treeId, node: null},
                    })
                    .then(({data}) =>
                        setTreeSourcesByTreeId(previous => ({
                            ...previous,
                            [treeId]: mapTreeNodesToSplitSource(data.treeNodeChildren?.list ?? []),
                        })),
                    )
                    .catch(() => {
                        // Forgotten rather than remembered as failed, so a later mount retries it. This
                        // does not loop: the effect only re-runs when the tree ids themselves change.
                        requestedTreeIdsRef.current.delete(treeId);
                        setTreeSourcesByTreeId(previous => ({...previous, [treeId]: TREE_SOURCE_ERROR}));
                    });
            });
    }, [treeIdsSignature, apolloClient]);

    // The lookup table itself is rebuilt on every render on purpose (no `useMemo`): it is read
    // synchronously while building the columns, never as a dependency. What must NOT be rebuilt are the
    // sources it points at — a tree's comes from state, a values list's from the cache above — since
    // their `option` objects are props of the sub-column headers and cells.
    const sources: ColumnSplitSourcesById = {};
    splittableAttributes.forEach(attribute => {
        const treeId = treeIdByAttributeId[attribute.id];

        sources[attribute.id] = treeId
            ? (treeSourcesByTreeId[treeId] ?? TREE_SOURCE_PENDING)
            : _getValuesListSource(attribute);
    });

    return sources;
};
