import {useEffect, useMemo, useReducer, useRef} from 'react';
import {type RecordFilterCondition} from '_ui/_gqlTypes';
import {type SerializedFilter} from '../ExplorerV2/_types';
import {FiltersActionTypes, filtersReducer} from './context/filtersReducer';
import {filtersInitialState} from './context/filtersInitialState';
import {isUIFilterTree, type UIFilter} from './_types';
import {uiFilterToConfig, useViewFiltersConverter} from './useViewFiltersConverter';
import {type ITreeFilterToResolve, useResolveTreeFilterNodes} from './useResolveTreeFilterNodes';

const noop = () => undefined;

/** Stable id of a lean filter = its attribute path ids joined by '/', matching app-studio's `getFilterId`. */
const leanFilterId = (attributes: Array<{id: string}>): string => attributes.map(attribute => attribute.id).join('/');

interface ILeanEntry {
    condition: RecordFilterCondition;
    values: Array<string | null>;
}

const valuesEqual = (a: Array<string | null>, b: Array<string | null>) =>
    a.length === b.length && a.every((value, index) => value === b[index]);

const leanEntryEqual = (a: ILeanEntry | undefined, b: ILeanEntry | undefined): boolean =>
    !!a && !!b && a.condition === b.condition && valuesEqual(a.values, b.values);

const projectionsEqual = (a: Map<string, ILeanEntry>, b: Map<string, ILeanEntry>): boolean => {
    if (a.size !== b.size) {
        return false;
    }
    for (const [id, entry] of a) {
        if (!leanEntryEqual(entry, b.get(id))) {
            return false;
        }
    }
    return true;
};

/**
 * Project a store of `UIFilter`s to a lean map keyed by filter id. A TREE filter with no user selection
 * (`userNodes == null`) is EXCLUDED — mirroring `prepareFiltersForRequest` skipping value-less trees,
 * and matching the hub projection (so a reloaded-but-unresolved tree never reads as a "change"). This is
 * the canonical comparison currency between the hub and a store on both directions of the sync.
 */
const projectLean = (filters: UIFilter[]): Map<string, ILeanEntry> => {
    const projection = new Map<string, ILeanEntry>();
    filters.forEach(filter => {
        if (isUIFilterTree(filter) && filter.userNodes == null) {
            return;
        }
        const {id, condition, values} = uiFilterToConfig(filter);
        projection.set(id, {condition, values});
    });
    return projection;
};

/** Lean, serializable emission shape (the message-ready `SerializedFilter[]` handed to `onChange`). */
const toLeanFilters = (filters: UIFilter[]): SerializedFilter[] =>
    filters
        .filter(filter => !(isUIFilterTree(filter) && filter.userNodes == null))
        .map(filter => {
            const {id, condition, values} = uiFilterToConfig(filter);
            return {
                attributes: id.split('/').map(attributeId => ({id: attributeId})),
                condition,
                values,
                pinned: true,
            } satisfies SerializedFilter;
        });

interface IUseControlledFilterStoreProps {
    /** The lean user filters from the controlled view (`currentView.filters`, non-hidden). */
    leanFilters: SerializedFilter[];
    libraryId: string | null;
    viewId?: string | null;
    /**
     * Called with the WHOLE current lean filter set whenever the user edits OR removes a filter in THIS
     * store (echo-suppressed: a value pushed in from the hub never re-fires it). Absent in standalone
     * usage (no host to write back to). Read via ref for referential stability.
     */
    onChange?: (filters: SerializedFilter[]) => void;
}

/**
 * Shared, anti-drift filter store for ONE spoke of the filters hub & spoke (ADR-006): the view-settings
 * volet and ExplorerV2 each own a SEPARATE instance of this store (never a shared React context, so the
 * contract survives an iframe boundary). Both reconstruct a rich `UIFilter` store from the lean
 * `currentView.filters` and write back ONLY lean — the `CurrentViewStore` stays the single source of
 * truth.
 *
 * Three coordinated effects make the hub↔spoke cycle contractive (each hop is a no-op or converges in one
 * round — see ADR-006 / the LEAVC-810 walks):
 *
 * 1. **SEED / reseed** (structural or tree-resolution change): pinned lean filters are converted to
 *    `UIFilter[]` (`useViewFiltersConverter`) and tree record ids resolved to nodes
 *    (`useResolveTreeFilterNodes`); the store is re-seeded merge-preserving live filter objects by id.
 *    A tree merge compares recordId VALUES: a live selection of the same value is preserved, but a
 *    resolved seed of a DIFFERENT value (a hub push from the other spoke) is adopted — trees skip the
 *    ADOPT effect, so this is their only adoption path. Value edits do NOT reseed.
 * 2. **ADOPT** (hub → store, value only): a value edited on the OTHER spoke arrives via the hub; when it
 *    diverges from `lastSyncedLeanRef`, it is reconciled into this store (`CHANGE_FILTER_CONFIG`) so both
 *    surfaces show it. This is the only behaviour new vs. the former single shared store.
 * 3. **EMIT** (store → hub, value/removal): when the store's lean projection diverges from
 *    `lastSyncedLeanRef`, a local edit/removal happened → emit the WHOLE lean set ONCE, then re-sync the
 *    ref. `lastSyncedLeanRef` (keyed on the lean VALUE, not object identity) is what suppresses echoes.
 */
export const useControlledFilterStore = ({
    leanFilters,
    libraryId,
    viewId,
    onChange,
}: IUseControlledFilterStoreProps) => {
    const {uiFilters, attributesDataById, loading} = useViewFiltersConverter(leanFilters);

    // Pinned TREE filters with stored values must be resolved (record ids → nodes) to apply + display.
    const treeFiltersToResolve = useMemo<ITreeFilterToResolve[]>(
        () =>
            leanFilters.flatMap(filter => {
                const attributeId = filter.attributes[filter.attributes.length - 1]?.id;
                const attribute = attributeId ? attributesDataById[attributeId] : undefined;
                const treeId =
                    attribute && 'linked_tree' in attribute
                        ? (attribute as {linked_tree?: {id?: string}}).linked_tree?.id
                        : undefined;
                const recordIds = (filter.values ?? []).filter((value): value is string => !!value);
                if (!treeId || !attributeId || recordIds.length === 0) {
                    return [];
                }
                return [{id: leanFilterId(filter.attributes), treeId, attributeId, recordIds}];
            }),
        [leanFilters, attributesDataById],
    );

    const {resolvedById} = useResolveTreeFilterNodes(treeFiltersToResolve, libraryId);

    // Enrich the converted (empty) tree filters with their resolved nodes so they apply + display.
    const seedFilters = useMemo<UIFilter[]>(
        () =>
            uiFilters.map(uiFilter => {
                const resolved = resolvedById[uiFilter.id];
                if (!isUIFilterTree(uiFilter) || !resolved || resolved.length === 0) {
                    return uiFilter;
                }
                const nodes = resolved.map(node => ({nodeId: node.nodeId, libraryId: node.libraryId}));
                return {
                    ...uiFilter,
                    value: resolved.map(node => node.recordId),
                    nodes,
                    userNodes: nodes,
                    userFormattedValue: resolved.map(node => node.label),
                };
            }),
        [uiFilters, resolvedById],
    );

    const [filtersData, dispatch] = useReducer(filtersReducer(noop), {
        ...filtersInitialState,
        libraryId: libraryId ?? null,
    });

    // Latest values read inside effects WITHOUT depending on them (the inputs are fresh arrays each
    // render — e.g. PanelAttributeExplorer rebuilds currentView — so effects key on string signatures).
    const filtersDataRef = useRef(filtersData);
    filtersDataRef.current = filtersData;
    const seedFiltersRef = useRef(seedFilters);
    seedFiltersRef.current = seedFilters;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // The lean projection last synchronized with the hub. Mediates BOTH directions (G3): a hub change
    // updates it (SEED/ADOPT) before/as the store reflects it → recognised as an echo, not re-emitted; a
    // store edit is emitted only when the store diverges from it.
    const lastSyncedLeanRef = useRef<Map<string, ILeanEntry>>(new Map());

    // Set of pinned filter ids (attribute paths) — NOT their values. Drives structural reseeds only.
    const structuralSignature = useMemo(
        () => leanFilters.map(filter => leanFilterId(filter.attributes)).join('|'),
        [leanFilters],
    );

    // Stable string signature of the hub's lean VALUES, so ADOPT runs only on a real value change even
    // though `seedFilters` is a fresh array every render.
    const hubValueSignature = useMemo(() => JSON.stringify([...projectLean(seedFilters)]), [seedFilters]);

    // 1. SEED / reseed on structural (or metadata / tree-resolution) change, merge-preserving live filter
    //    objects by id. For trees, a genuine live user selection (`userNodes` set) is preserved; otherwise
    //    the (possibly just-resolved) seed wins so a reloaded tree filter upgrades from empty to resolved.
    useEffect(() => {
        if (loading) {
            return;
        }
        // Nothing to seed and the store is already empty → skip the RESET (it would allocate a new state
        // object and force a no-op re-render for the common no-filters explorer).
        if (seedFiltersRef.current.length === 0 && filtersDataRef.current.filters.length === 0) {
            return;
        }
        const existingById = new Map((filtersDataRef.current.filters as UIFilter[]).map(filter => [filter.id, filter]));
        const merged = seedFiltersRef.current.map(seed => {
            const existing = existingById.get(seed.id);
            if (!existing) {
                return seed;
            }
            if (isUIFilterTree(existing)) {
                // No live selection here → take the (possibly just-resolved) seed.
                if (existing.userNodes == null) {
                    return seed;
                }
                // The seed isn't resolved yet (resolution in flight) → never clobber a live selection
                // with an empty seed.
                if (!isUIFilterTree(seed) || seed.userNodes == null) {
                    return existing;
                }
                // Both have a selection: keep the live one UNLESS the hub pushed a DIFFERENT value (e.g.
                // the OTHER spoke — the volet — edited the tree). Trees skip the ADOPT effect, so this is
                // the only place a hub-pushed tree value reaches this store; comparing record-id values
                // (not object identity) lets a volet edit propagate while a same-value re-resolution or a
                // structural reseed preserves the live nodes/formatting.
                const seedValue = seed.value ?? [];
                const existingValue = existing.value ?? [];
                const sameValue =
                    seedValue.length === existingValue.length &&
                    seedValue.every((value, index) => value === existingValue[index]);
                return sameValue ? existing : seed;
            }
            return existing;
        });
        dispatch({
            type: FiltersActionTypes.RESET,
            payload: {
                ...filtersDataRef.current,
                libraryId: libraryId ?? null,
                viewId: viewId ?? null,
                filters: merged,
                initialFilters: merged,
                attributesDataById,
                loading: false,
            },
        });
        // `lastSyncedLeanRef` is NOT touched here: the RESET only lands on the NEXT render, so updating the
        // ref now would make EMIT (running this same commit on the stale, still-old store) see a phantom
        // divergence and emit. EMIT owns the ref and recognises the seed as an echo via the hub comparison.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [structuralSignature, attributesDataById, loading, resolvedById]);

    // 2. ADOPT external value changes (hub → store) WITHOUT a structural change: a non-tree value edited
    //    on the other spoke arrives through the hub; reconcile it so this surface shows it too. Trees are
    //    adopted via the SEED merge (resolvedById), never here. EMIT re-syncs the ref once the store lands.
    useEffect(() => {
        if (loading) {
            return;
        }
        const hubProjection = projectLean(seedFiltersRef.current);
        const storeIds = new Set((filtersDataRef.current.filters as UIFilter[]).map(filter => filter.id));
        seedFiltersRef.current.forEach(seed => {
            if (isUIFilterTree(seed) || !storeIds.has(seed.id)) {
                return;
            }
            if (!leanEntryEqual(hubProjection.get(seed.id), lastSyncedLeanRef.current.get(seed.id))) {
                dispatch({type: FiltersActionTypes.CHANGE_FILTER_CONFIG, payload: seed});
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hubValueSignature, loading]);

    // 3. EMIT local edits/removals (store → hub) — the sole `lastSyncedLeanRef` writer:
    //    - store == hub projection  → in sync (seed / adopt / hub caught up) → re-sync ref, NEVER emit.
    //    - store == last-synced ref → hub diverged but ADOPT will reconcile → don't emit.
    //    - otherwise                → a genuine local edit/removal → emit the whole lean set ONCE.
    useEffect(() => {
        const store = filtersData.filters as UIFilter[];
        const storeProjection = projectLean(store);
        if (projectionsEqual(storeProjection, projectLean(seedFiltersRef.current))) {
            lastSyncedLeanRef.current = storeProjection;
            return;
        }
        if (projectionsEqual(storeProjection, lastSyncedLeanRef.current)) {
            return;
        }
        lastSyncedLeanRef.current = storeProjection;
        onChangeRef.current?.(toLeanFilters(store));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtersData.filters]);

    return {filtersData, dispatch};
};
