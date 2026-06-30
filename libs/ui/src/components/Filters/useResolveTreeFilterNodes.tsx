import {useApolloClient} from '@apollo/client';
import {useEffect, useMemo, useState} from 'react';
import {type FilterTreeDataQueryQuery} from '_ui/_gqlTypes';
import {filterTreeDataQuery} from './filter-items/filter-type/tree/_queries/filterTreeDataQuery';

/** A pinned tree filter to restore: its stored record ids must be resolved back to tree nodes. */
export interface ITreeFilterToResolve {
    /** Filter id = attribute path (matches the UIFilter id produced by `useViewFiltersConverter`). */
    id: string;
    treeId: string;
    attributeId: string;
    recordIds: string[];
}

export interface IResolvedTreeNode {
    nodeId: string;
    libraryId: string;
    recordId: string;
    label: string;
}

type TreeContentNode = FilterTreeDataQueryQuery['treeContent'][number] & {children?: TreeContentNode[]};

const flattenTree = (nodes: TreeContentNode[]): IResolvedTreeNode[] =>
    nodes.flatMap(node => [
        {
            nodeId: node.id,
            libraryId: node.record.whoAmI.library.id,
            recordId: node.record.id,
            label: node.record.whoAmI.label ?? node.record.whoAmI.id,
        },
        ...flattenTree((node.children as TreeContentNode[]) ?? []),
    ]);

/**
 * Restores SAVED tree filters on reload. ViewV2 storage keeps only a tree filter's selected record ids
 * (`values`), but a tree filter needs the full `{nodeId, libraryId, label}` per selection to filter
 * correctly (`attribut.<libraryId>.id`, since a bare field filters on the tree libraries' label
 * attributes — see core `getAttributesFromField`), to show its badge, and to appear checked. This hook
 * fetches each tree (`filterTreeDataQuery` / `treeContent` — the SAME query the filter dropdown uses, so
 * it is usually a cache hit) and maps the stored record ids back to nodes. Returns the resolved nodes
 * keyed by filter id (empty until the fetch settles). One (cache-first) query per distinct tree filter.
 */
export const useResolveTreeFilterNodes = (
    treeFilters: ITreeFilterToResolve[],
    libraryId: string | null,
): {resolvedById: Record<string, IResolvedTreeNode[]>; loading: boolean} => {
    const client = useApolloClient();
    const [resolvedById, setResolvedById] = useState<Record<string, IResolvedTreeNode[]>>({});
    const [loading, setLoading] = useState(false);

    const signature = useMemo(
        () =>
            JSON.stringify(treeFilters.map(filter => [filter.id, filter.treeId, filter.attributeId, filter.recordIds])),
        [treeFilters],
    );

    useEffect(() => {
        if (!libraryId || treeFilters.length === 0) {
            // Keep the SAME empty object reference when already empty, so a consumer that has no tree
            // filters (the common case) doesn't get a spurious extra render on every mount.
            setResolvedById(prev => (Object.keys(prev).length === 0 ? prev : {}));
            return;
        }
        let cancelled = false;
        setLoading(true);

        (async () => {
            const entries = await Promise.all(
                treeFilters.map(async filter => {
                    if (!filter.treeId || filter.recordIds.length === 0) {
                        return [filter.id, [] as IResolvedTreeNode[]] as const;
                    }
                    try {
                        const {data} = await client.query<FilterTreeDataQueryQuery>({
                            query: filterTreeDataQuery(),
                            variables: {
                                treeId: filter.treeId,
                                accessRecordByDefaultPermission: {attributeId: filter.attributeId, libraryId},
                            },
                            fetchPolicy: 'cache-first',
                        });
                        const byRecordId = new Map(
                            flattenTree((data?.treeContent as TreeContentNode[]) ?? []).map(node => [
                                node.recordId,
                                node,
                            ]),
                        );
                        const resolved = filter.recordIds
                            .map(recordId => byRecordId.get(recordId))
                            .filter((node): node is IResolvedTreeNode => Boolean(node));
                        return [filter.id, resolved] as const;
                    } catch {
                        return [filter.id, [] as IResolvedTreeNode[]] as const;
                    }
                }),
            );
            if (!cancelled) {
                setResolvedById(Object.fromEntries(entries));
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature, libraryId]);

    return {resolvedById, loading};
};
