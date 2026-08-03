import {useApolloClient} from '@apollo/client';
import {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {useLang} from '_ui/hooks';
import {
    ExplorerLibraryDataDocument,
    useListDistinctValuesQuery,
    useRecordUpdateSubscription,
    type ExplorerLibraryDataQuery,
    type ExplorerLibraryDataQueryVariables,
    type RecordFilterInput,
} from '_ui/_gqlTypes';
import {KANBAN_COLUMN_PAGE_SIZE, KANBAN_SELF_WRITE_ECHO_WINDOW_MS} from '../_constants';
import {type IExplorerData, type IItemData} from '../_types';
import {NO_AXIS_VALUE_COLUMN_ID} from '../grouping/buildKanbanColumns';
import {appendGroupFilter, buildNoValueGroupFilter, buildTreeGroupEqualityFilter} from '../grouping/groupFilters';
import {mapLibraryDataToExplorerData} from '../_queries/mapLibraryDataToExplorerData';
import {mapDistinctValuesToCounts} from '../_queries/mapDistinctValuesToCounts';
import {kanbanColumnsReducer} from './kanbanColumnsReducer';
import {type IKanbanColumnsDataOptions, type IKanbanColumnsData} from './_types';

/**
 * Owns the per-column kanban data: one listDistinctValues query for the counts, then one records page per
 * column (KANBAN_COLUMN_PAGE_SIZE cards), further pages loaded on demand ("Voir plus"). Pages are
 * fetched imperatively (concurrent one-shot queries); the column states live in a pure reducer and the
 * next page offset is always the number of loaded cards. A request signature guards against responses
 * arriving after the view (filters/search/sorts) changed.
 */
export const useKanbanColumnsData = ({
    dataSource,
    axisAttributeId,
    selfWriteEchoWindowMs = KANBAN_SELF_WRITE_ECHO_WINDOW_MS,
}: IKanbanColumnsDataOptions): IKanbanColumnsData => {
    const apolloClient = useApolloClient();
    const {lang: availableLangs} = useLang();

    const [columnStatesById, dispatch] = useReducer(kanbanColumnsReducer, {});
    const [attributesProperties, setAttributesProperties] = useState<IExplorerData['attributes']>({});
    // True from a board reset (view change or external record update) until the fresh counts land.
    // Consumers (Explorer.tsx) freeze the values they derive from columnStatesById on it, so the
    // results count and the mass-selection wiring don't flicker to 0/empty during the reload window.
    const [isReloading, setIsReloading] = useState(true);

    const isEnabled = !!dataSource && !!axisAttributeId;
    const requestSignature = useMemo(
        () => JSON.stringify({dataSource, axisAttributeId}),
        [dataSource, axisAttributeId],
    );
    const requestSignatureRef = useRef(requestSignature);
    // Suffixes requestSignatureRef.current on a subscription-triggered reload (see below), so it stays
    // unique without depending on the view itself changing.
    const manualReloadCounterRef = useRef(0);

    // Filled from the counts response (mapDistinctValuesToCounts) before the first pages load, so a
    // column's card request always finds its node library — no dependency on the tree-nodes query.
    const nodeLibraryIdByRecordIdRef = useRef<Record<string, string>>({});

    // Snapshotted just before a reset (view change or recordUpdate): how many cards each column had
    // already loaded (e.g. via "Voir plus"). The reload effect below reads it to fetch as many pages
    // as needed to reach that same depth again, instead of collapsing every column back to page 1.
    const loadedCountByColumnIdRef = useRef<Record<string, number>>({});

    // Record ids this client is currently writing through a drag & drop, each mapped to a timer that
    // ends its echo-suppression window. The recordUpdate subscription (see below) fires on every write
    // in the library, including our own; a self-write is already reconciled optimistically (cardMoved),
    // so its echo must not trigger a full board reset+reload. A single write can emit zero, one, or many
    // echoes, so we cannot consume one per event: instead EVERY echo of a flagged id is swallowed until
    // the window elapses (markSelfWrite), the flag auto-expires (so a later genuine external update to
    // the same record is never wrongly swallowed), and a failed write clears it eagerly.
    const selfWriteEchoTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    useEffect(() => {
        const timers = selfWriteEchoTimersRef.current;
        return () => {
            timers.forEach(timer => clearTimeout(timer));
            timers.clear();
        };
    }, []);

    const loadPage = useCallback(
        (columnId: string, offset: number, onSettled?: (loadedRecordCount: number) => void) => {
            if (!isEnabled) {
                return;
            }

            const nodeLibraryId = nodeLibraryIdByRecordIdRef.current[columnId];
            const groupFilter: RecordFilterInput | null =
                columnId === NO_AXIS_VALUE_COLUMN_ID
                    ? buildNoValueGroupFilter(axisAttributeId)
                    : nodeLibraryId
                      ? buildTreeGroupEqualityFilter({
                            attributeId: axisAttributeId,
                            nodeLibraryId,
                            nodeRecordId: columnId,
                        })
                      : null;

            if (groupFilter === null) {
                return;
            }

            const pageSignature = requestSignatureRef.current;
            dispatch({type: 'cardsLoadStarted', columnId});

            const variables: ExplorerLibraryDataQueryVariables = {
                libraryId: dataSource.libraryId,
                attributeIds: dataSource.attributeIds,
                pagination: {limit: KANBAN_COLUMN_PAGE_SIZE, offset},
                searchQuery: dataSource.searchQuery,
                multipleSort: dataSource.sorts,
                filters: appendGroupFilter(dataSource.filters, groupFilter),
            };

            // apolloClient.query (not the generated hook): N independent one-shot queries fan out per
            // column, each with its own offset/lifecycle, not a single reactive query tied to a render.
            apolloClient
                .query<ExplorerLibraryDataQuery>({
                    query: ExplorerLibraryDataDocument,
                    fetchPolicy: 'network-only',
                    variables,
                })
                .then(({data}) => {
                    if (requestSignatureRef.current !== pageSignature) {
                        return;
                    }

                    const pageData = mapLibraryDataToExplorerData(data, dataSource.libraryId, availableLangs);
                    setAttributesProperties(previous => ({...previous, ...pageData.attributes}));
                    dispatch({
                        type: 'cardsLoaded',
                        columnId,
                        cards: pageData.records,
                        // A short page = the server is out of records for this column, even if the column
                        // count still claims more (counts ignore the search, V1) — see isExhausted.
                        isLastPage: pageData.records.length < KANBAN_COLUMN_PAGE_SIZE,
                    });
                    onSettled?.(pageData.records.length);
                })
                .catch(() => {
                    if (requestSignatureRef.current !== pageSignature) {
                        return;
                    }

                    dispatch({type: 'cardsLoadFailed', columnId});
                });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- dataSource is captured through its signature
        [isEnabled, requestSignature, axisAttributeId, apolloClient, availableLangs],
    );

    // Chains loadPage calls for one column until it has re-loaded as many cards as it held before the
    // reset (targetCount), or a page comes back short/empty — the server is then out of records for the
    // column (short = below the page size), a further page at the next offset could only come back
    // empty. A stale-response page (view changed again mid-chain) settles nothing, so the chain
    // naturally stops there too.
    const loadUntil = useCallback(
        function loadUntilRecursive(columnId: string, offset: number, targetCount: number) {
            if (offset >= targetCount) {
                return;
            }

            loadPage(columnId, offset, loadedRecordCount => {
                const isPageFull = loadedRecordCount === KANBAN_COLUMN_PAGE_SIZE;
                if (isPageFull && offset + loadedRecordCount < targetCount) {
                    loadUntilRecursive(columnId, offset + loadedRecordCount, targetCount);
                }
            });
        },
        [loadPage],
    );

    // A view change (filters, search, sorts…) invalidates everything: in-flight pages and loaded cards.
    useEffect(() => {
        loadedCountByColumnIdRef.current = Object.fromEntries(
            Object.entries(columnStatesById).map(([columnId, columnState]) => [columnId, columnState.cards.length]),
        );
        requestSignatureRef.current = requestSignature;
        setIsReloading(true);
        dispatch({type: 'reset'});
        setAttributesProperties({});
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only the view change (requestSignature) should trigger this reset, not every columnStatesById update
    }, [requestSignature]);

    const {
        data: countsData,
        loading: isCountsLoading,
        refetch: refetchCounts,
    } = useListDistinctValuesQuery({
        skip: !isEnabled,
        fetchPolicy: 'network-only',
        variables: {
            library: dataSource?.libraryId ?? '',
            attribute: axisAttributeId ?? '',
            recordFilters: dataSource?.filters,
        },
    });

    // The board's cards are plain reducer state (see loadPage above), with no link to Apollo's cache
    // reactivity — unlike TableView (useExplorerData), a record update elsewhere never reaches it. A
    // record update in the library can move a card across columns (its axis value changed) or alter a
    // displayed attribute, so a fresh update is not patched onto individual cards: the whole board is
    // re-derived from scratch, the same way a filter/search/sort change already resets and reloads it.
    // Variables are memoized on the library id: a fresh object literal each render makes
    // useRecordUpdateSubscription tear down and re-open the subscription on every re-render.
    const recordUpdateVariables = useMemo(
        () => ({filters: {libraries: dataSource ? [dataSource.libraryId] : []}}),
        [dataSource?.libraryId],
    );
    useRecordUpdateSubscription({
        skip: !isEnabled,
        variables: recordUpdateVariables,
        onData: ({data: subscriptionResult}) => {
            // Our own drag & drop write comes back through this subscription: it is already reconciled
            // optimistically (cardMoved), so swallow its echo instead of resetting and reloading the
            // whole board — that reset is what made a self-move flash. Every echo of the id is swallowed
            // while the suppression window is open (the flag is NOT consumed on the first one, since a
            // single write may echo several times); the window auto-expires so later genuine updates pass.
            const updatedRecordId = subscriptionResult.data?.recordUpdate.record.id;
            if (updatedRecordId !== undefined && selfWriteEchoTimersRef.current.has(updatedRecordId)) {
                return;
            }

            loadedCountByColumnIdRef.current = Object.fromEntries(
                Object.entries(columnStatesById).map(([columnId, columnState]) => [columnId, columnState.cards.length]),
            );
            manualReloadCounterRef.current += 1;
            // Set synchronously (not through the requestSignature-keyed effect, which runs later as a
            // passive effect): a page already in flight must be discarded by loadPage's stale-response
            // guard as soon as it resolves, even if that happens before React re-renders.
            requestSignatureRef.current = `${requestSignature}#reload-${manualReloadCounterRef.current}`;
            setIsReloading(true);
            dispatch({type: 'reset'});
            setAttributesProperties({});
            refetchCounts();
        },
    });

    // Loads (or reloads) every column's cards, up to however many it had before the reset. Triggered
    // both when fresh counts arrive and on any view change (requestSignature): attribute-list and sort
    // changes don't alter the counts query variables, so countsData alone would not re-fire — the board
    // would stay empty after the reset.
    useEffect(() => {
        if (!isEnabled || isCountsLoading || !countsData) {
            return;
        }

        const {countByNodeRecordId, libraryIdByNodeRecordId, noValueCount} = mapDistinctValuesToCounts(
            countsData.listDistinctValues ?? [],
        );
        const countByColumnId =
            noValueCount > 0 ? {...countByNodeRecordId, [NO_AXIS_VALUE_COLUMN_ID]: noValueCount} : countByNodeRecordId;

        // Set before loadPage runs (same synchronous effect) so every column's filter finds its library.
        nodeLibraryIdByRecordIdRef.current = libraryIdByNodeRecordId;
        dispatch({type: 'countsLoaded', countByColumnId});
        setIsReloading(false);

        // The reset (same signature change) has cleared every column, so each starts from offset 0. A
        // column previously loaded past its first page (via "Voir plus") is re-fetched up to that same
        // depth — capped to the fresh count, in case records left the column in the meantime — instead
        // of collapsing back to a single page.
        Object.entries(countByColumnId).forEach(([columnId, count]) => {
            const previouslyLoadedCount = loadedCountByColumnIdRef.current[columnId] ?? 0;
            const targetCount = Math.max(KANBAN_COLUMN_PAGE_SIZE, Math.min(previouslyLoadedCount, count));
            loadUntil(columnId, 0, targetCount);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- loadUntil/loadPage intentionally absent: recreated in lockstep with requestSignature (already a dep) and reads requestSignatureRef, so stale responses are discarded by the signature guard in .then(); listing them would add no new trigger.
    }, [isEnabled, isCountsLoading, countsData, requestSignature]);

    const loadMore = useCallback(
        (columnId: string) => {
            const columnState = columnStatesById[columnId];
            // isExhausted: the server already returned a short page for this column — a further page at
            // the same offset can only come back empty ("Voir plus" is hidden then, this is a belt).
            if (!columnState || columnState.isLoadingMore || columnState.isExhausted) {
                return;
            }

            loadPage(columnId, columnState.cards.length);
        },
        [columnStatesById, loadPage],
    );

    const applyCardMove = useCallback(
        ({card, fromColumnId, toColumnId}: {card: IItemData; fromColumnId: string; toColumnId: string}) => {
            dispatch({type: 'cardMoved', card, fromColumnId, toColumnId});
        },
        [],
    );

    const markSelfWrite = useCallback(
        (recordId: string) => {
            const timers = selfWriteEchoTimersRef.current;
            // Re-marking the same id (e.g. a second drag before the first window closed) restarts its window.
            const existingTimer = timers.get(recordId);
            if (existingTimer !== undefined) {
                clearTimeout(existingTimer);
            }
            timers.set(
                recordId,
                setTimeout(() => {
                    timers.delete(recordId);
                }, selfWriteEchoWindowMs),
            );
        },
        [selfWriteEchoWindowMs],
    );

    const clearSelfWrite = useCallback((recordId: string) => {
        const timers = selfWriteEchoTimersRef.current;
        const existingTimer = timers.get(recordId);
        if (existingTimer !== undefined) {
            clearTimeout(existingTimer);
            timers.delete(recordId);
        }
    }, []);

    // Reloads only the given columns up to the depth they currently hold: clears their cards then
    // re-fetches page by page from the server. Used to snap the source and target columns back to the
    // server truth after a refused move, without the full-board reset the subscription would do.
    const reloadColumns = useCallback(
        (columnIds: string[]) => {
            const reloadTargets = columnIds.map(columnId => ({
                columnId,
                targetCount: Math.max(KANBAN_COLUMN_PAGE_SIZE, columnStatesById[columnId]?.cards.length ?? 0),
            }));

            dispatch({type: 'columnsReset', columnIds});
            reloadTargets.forEach(({columnId, targetCount}) => loadUntil(columnId, 0, targetCount));
        },
        [columnStatesById, loadUntil],
    );

    return {
        // Only the very first load blanks the board; a background refetch (e.g. an external
        // recordUpdate) keeps the previous counts, so the board is never unmounted mid-refetch.
        isInitialLoading: isCountsLoading && !countsData,
        isReloading,
        attributesProperties,
        columnStatesById,
        loadMore,
        applyCardMove,
        markSelfWrite,
        clearSelfWrite,
        reloadColumns,
    };
};
