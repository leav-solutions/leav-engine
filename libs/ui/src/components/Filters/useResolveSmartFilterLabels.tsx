import {useApolloClient} from '@apollo/client';
import {useEffect, useMemo, useState} from 'react';
import {type SmartFilterListValuesQuery, SmartFilterListValuesDocument} from '_ui/_gqlTypes';

/** A pinned smart filter whose stored value ids must be resolved back to display labels. */
export interface ISmartFilterToResolve {
    /** Filter id = attribute path (matches the UIFilter id produced by `useViewFiltersConverter`). */
    id: string;
    /** The smart filter attribute id (first path segment) — the `listDistinctValues` `attribute` arg. */
    attributeId: string;
}

/**
 * Restores the display LABELS of smart filters across spokes and reloads. ViewV2 storage — and the lean
 * hub — keep only a smart filter's selected value ids (`values`), never their labels. So a value adopted
 * from the OTHER spoke (or seeded from a saved view) arrives with no `formattedValue`, and the
 * `CommonFilterItem` chip shows stale/empty labels (the desync between the toolbar and the volet). Mirrors
 * `useResolveTreeFilterNodes`: each spoke fetches its smart filters' distinct values (`listDistinctValues`
 * — the SAME query the dropdown uses, so it is usually a cache hit) and maps every value id → label.
 *
 * The query is context-INDEPENDENT (no `recordFilters`): a record's label doesn't depend on the other
 * filters, and we must be able to label a selected value even when the current context would filter it
 * out. A `through` smart filter is handled by the core (it traverses the through attribute for
 * `listDistinctValues`, returning the through-target records' labels). One (cache-first) query per
 * distinct smart filter. Returns labels keyed by filter id then value id (empty until the fetch settles).
 */
export const useResolveSmartFilterLabels = (
    smartFilters: ISmartFilterToResolve[],
    libraryId: string | null,
): {labelsById: Record<string, Record<string, string>>; loading: boolean} => {
    const client = useApolloClient();
    const [labelsById, setLabelsById] = useState<Record<string, Record<string, string>>>({});
    const [loading, setLoading] = useState(false);

    const signature = useMemo(
        () => JSON.stringify(smartFilters.map(filter => [filter.id, filter.attributeId])),
        [smartFilters],
    );

    useEffect(() => {
        if (!libraryId || smartFilters.length === 0) {
            // Keep the SAME empty object reference when already empty, so a consumer with no smart filters
            // (the common case) doesn't get a spurious extra render on every mount.
            setLabelsById(prev => (Object.keys(prev).length === 0 ? prev : {}));
            return;
        }
        let cancelled = false;
        setLoading(true);

        (async () => {
            const entries = await Promise.all(
                smartFilters.map(async filter => {
                    try {
                        const {data} = await client.query<SmartFilterListValuesQuery>({
                            query: SmartFilterListValuesDocument,
                            variables: {library: libraryId, attribute: filter.attributeId},
                            fetchPolicy: 'cache-first',
                        });
                        const labels: Record<string, string> = {};
                        (data?.listDistinctValues ?? []).forEach(occurrence => {
                            if ('recordValue' in occurrence && occurrence.recordValue) {
                                // The selected value stored on the filter is the linked record's whoAmI.id
                                // (see useGetSmartFilterData / SmartFilterAttributeDropdown), so key on it.
                                const {whoAmI} = occurrence.recordValue;
                                labels[whoAmI.id] = whoAmI.label ?? whoAmI.id;
                            } else if ('standardValue' in occurrence && occurrence.standardValue != null) {
                                labels[occurrence.standardValue] = occurrence.standardValue;
                            }
                        });
                        return [filter.id, labels] as const;
                    } catch {
                        const emptyLabels: Record<string, string> = {};
                        return [filter.id, emptyLabels] as const;
                    }
                }),
            );
            if (!cancelled) {
                setLabelsById(Object.fromEntries(entries));
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature, libraryId]);

    return {labelsById, loading};
};
