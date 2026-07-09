import {useEffect, useMemo, useReducer, useRef} from 'react';
import {type RecordFilterCondition} from '_ui/_gqlTypes';
import {type SerializedFilter} from '../ExplorerV2/_types';
import {FiltersActionTypes, filtersReducer} from './context/filtersReducer';
import {filtersInitialState} from './context/filtersInitialState';
import {isUIFilterTree, isUIFilterWithSmartFilter, type IUIFilterTree, type UIFilter} from './_types';
import {uiFilterToConfig, useViewFiltersConverter} from './useViewFiltersConverter';
import {type ITreeFilterToResolve, useResolveTreeFilterNodes} from './useResolveTreeFilterNodes';
import {type ISmartFilterToResolve, useResolveSmartFilterLabels} from './useResolveSmartFilterLabels';

const noop = () => undefined;

/** Stable id of a lean filter = its attribute path ids joined by '/', matching app-studio's `getFilterId`. */
const leanFilterId = (attributes: Array<{id: string}>): string => attributes.map(attribute => attribute.id).join('/');

interface ILeanEntry {
    condition: RecordFilterCondition;
    values: Array<string | null>;
    withEmptyValues?: boolean;
}

const valuesEqual = (a: Array<string | null>, b: Array<string | null>) =>
    a.length === b.length && a.every((value, index) => value === b[index]);

const leanEntryEqual = (a: ILeanEntry | undefined, b: ILeanEntry | undefined): boolean =>
    !!a &&
    !!b &&
    a.condition === b.condition &&
    !!a.withEmptyValues === !!b.withEmptyValues &&
    valuesEqual(a.values, b.values);

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
        if (isUIFilterTree(filter) && filter.userNodes == null && !filter.withEmptyValues) {
            return;
        }
        const {id, condition, values, withEmptyValues} = uiFilterToConfig(filter);
        projection.set(id, {condition, values, withEmptyValues});
    });
    return projection;
};

/** Lean, serializable emission shape (the message-ready `SerializedFilter[]` handed to `onChange`). */
const toLeanFilters = (filters: UIFilter[]): SerializedFilter[] =>
    filters
        .filter(filter => !(isUIFilterTree(filter) && filter.userNodes == null && !filter.withEmptyValues))
        .map(filter => {
            const {id, condition, values, withEmptyValues} = uiFilterToConfig(filter);
            return {
                attributes: id.split('/').map(attributeId => ({id: attributeId})),
                condition,
                values,
                pinned: true,
                withEmptyValues,
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

    // Pinned SMART filters with values need their labels resolved (value ids → labels) to display: the
    // lean hub carries only ids, so a value adopted from the other spoke or seeded from a saved view has
    // no formattedValue. Keyed on (id, attributeId) only — the label query is context-independent, so it
    // is stable across value edits (unlike the tree resolution, which keys on the selected recordIds).
    const smartFiltersToResolve = useMemo<ISmartFilterToResolve[]>(
        () =>
            leanFilters.flatMap(filter => {
                const attributeId = filter.attributes[0]?.id;
                const attribute = attributeId ? attributesDataById[attributeId] : undefined;
                const isSmartFilter =
                    !!attribute &&
                    'smart_filter' in attribute &&
                    !!(attribute as {smart_filter?: {enable?: boolean}}).smart_filter?.enable;
                const hasValue = (filter.values ?? []).some(value => !!value);
                if (!isSmartFilter || !attributeId || !hasValue) {
                    return [];
                }
                return [{id: leanFilterId(filter.attributes), attributeId}];
            }),
        [leanFilters, attributesDataById],
    );

    const {labelsById: smartLabelsById} = useResolveSmartFilterLabels(smartFiltersToResolve, libraryId);

    // Enrich the converted (empty) tree filters with their resolved nodes so they apply + display.
    const seedFilters = useMemo<UIFilter[]>(
        () =>
            uiFilters.map(uiFilter => {
                const resolved = resolvedById[uiFilter.id];
                // Enrich ONLY a tree that is still AWAITING resolution (`userNodes == null`: the converter
                // saw stored record ids it could not resolve to nodes yet). A tree the converter already
                // gave an EXPLICIT empty selection (`userNodes: []`, i.e. the lean value is now empty) must
                // NOT be re-enriched: `resolvedById` clears one render LATER than `leanFilters` changes (it
                // lives in useState, cleared by an effect), so a just-emptied tree would otherwise be
                // re-hydrated from the STALE previous resolution — the cleared selection would silently pop
                // back and desync the spokes (the sync-mock test hid this; the real hook is async).
                if (!isUIFilterTree(uiFilter) || uiFilter.userNodes != null || !resolved || resolved.length === 0) {
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

    // SAVED (pre-edit) tree selections — the reset target for a tree filter. `treeFiltersToResolve` tracks
    // the LIVE hub recordIds (they change as the user edits), so we snapshot it per structural / metadata
    // change (never on a value edit) and resolve THOSE ids separately. Same tree → cache hit, so no real
    // extra fetch. Without it, editing tree nodes would overwrite `initialFilters` (a tree edit changes
    // `resolvedById` → reseeds), and "Réinitialiser" would restore the current nodes, not the saved ones.
    const savedTreeFiltersToResolve = useMemo(
        () => treeFiltersToResolve,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [structuralSignature, attributesDataById],
    );
    const {resolvedById: savedResolvedById} = useResolveTreeFilterNodes(savedTreeFiltersToResolve, libraryId);
    const savedResolvedByIdRef = useRef(savedResolvedById);
    savedResolvedByIdRef.current = savedResolvedById;

    // The stable RESET_FILTER target, preserved across reseeds: rebuilt only on a STRUCTURAL change so a
    // value edit never rebaselines it (a tree edit reseeds the whole store — this must not turn a standard
    // filter's "initial" into its edited value either).
    const initialFiltersRef = useRef<UIFilter[]>([]);
    const prevStructuralRef = useRef<string | null>(null);

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
        // Build the stable RESET target (`initialFilters`). Rebuild fully on a structural change (fresh
        // baseline / rebaseline on pin-unpin); otherwise PRESERVE it, only (re)filling each tree's nodes
        // from the SAVED resolution (which is edit-stable) so a tree reset restores its SAVED nodes and a
        // standard reset restores its SAVED value — even after a co-located tree edit forced a reseed.
        const isStructuralChange = prevStructuralRef.current !== structuralSignature;
        prevStructuralRef.current = structuralSignature;
        const previousInitialById = new Map(initialFiltersRef.current.map(filter => [filter.id, filter]));
        const buildTreeInitial = (base: IUIFilterTree): IUIFilterTree => {
            const saved = savedResolvedByIdRef.current[base.id] ?? [];
            if (saved.length === 0) {
                // Nothing was saved for this tree → "Réinitialiser" restores the EMPTY-but-PINNED state
                // (`userNodes: []`, never null). `null` reads as "no user selection / not resolved" and
                // drops the filter from the lean projection, so a reset-to-empty tree would fall out of
                // sync (the toolbar unpins / the volet keeps its values). `[]` keeps it pinned-but-empty
                // and propagates identically to a manual deselect-all across both spokes (Bugs 2 & 3).
                return {...base, value: [], nodes: [], userNodes: [], userFormattedValue: []};
            }
            const nodes = saved.map(node => ({nodeId: node.nodeId, libraryId: node.libraryId}));
            return {
                ...base,
                value: saved.map(node => node.recordId),
                nodes,
                userNodes: nodes,
                userFormattedValue: saved.map(node => node.label),
            };
        };
        const initialFilters = seedFiltersRef.current.map(seed => {
            const previous = previousInitialById.get(seed.id);
            if (isStructuralChange || !previous) {
                return isUIFilterTree(seed) ? buildTreeInitial(seed) : seed;
            }
            return isUIFilterTree(previous) ? buildTreeInitial(previous) : previous;
        });
        initialFiltersRef.current = initialFilters;
        dispatch({
            type: FiltersActionTypes.RESET,
            payload: {
                ...filtersDataRef.current,
                libraryId: libraryId ?? null,
                viewId: viewId ?? null,
                filters: merged,
                initialFilters,
                attributesDataById,
                loading: false,
            },
        });
        // `lastSyncedLeanRef` is NOT touched here: the RESET only lands on the NEXT render, so updating the
        // ref now would make EMIT (running this same commit on the stale, still-old store) see a phantom
        // divergence and emit. EMIT owns the ref and recognises the seed as an echo via the hub comparison.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [structuralSignature, attributesDataById, loading, resolvedById, savedResolvedById]);

    // 2. ADOPT external value changes (hub → store) WITHOUT a structural change: a value edited on the
    //    other spoke (or a RESET_VIEW) arrives through the hub; reconcile it so this surface shows it too.
    //    A tree's NODE selection is adopted via the SEED merge (it needs resolvedById) — adopting an
    //    unresolved seed here could clobber a live selection. But `withEmptyValues` is a resolution-free
    //    flag, so we DO adopt it here (onto the existing store filter, never touching its nodes): otherwise
    //    a hub change that only flips "non défini" (RESET_VIEW, other-spoke edit) never reaches this store.
    useEffect(() => {
        if (loading) {
            return;
        }
        const hubProjection = projectLean(seedFiltersRef.current);
        const storeById = new Map((filtersDataRef.current.filters as UIFilter[]).map(filter => [filter.id, filter]));
        seedFiltersRef.current.forEach(seed => {
            const existing = storeById.get(seed.id);
            if (!existing) {
                return;
            }
            if (isUIFilterTree(seed)) {
                if (!!existing.withEmptyValues !== !!seed.withEmptyValues) {
                    dispatch({
                        type: FiltersActionTypes.CHANGE_FILTER_CONFIG,
                        payload: {...existing, withEmptyValues: seed.withEmptyValues},
                    });
                }
                return;
            }
            if (!leanEntryEqual(hubProjection.get(seed.id), lastSyncedLeanRef.current.get(seed.id))) {
                dispatch({type: FiltersActionTypes.CHANGE_FILTER_CONFIG, payload: seed});
            }
        });
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
    }, [filtersData.filters]);

    // 4. LABEL a smart filter (display only): the lean hub carries value ids but no labels, so a value
    //    seeded from a saved view or adopted from the other spoke lands with a stale/empty formattedValue
    //    (the toolbar⇄volet chip desync). Once the labels resolve, patch each smart filter's
    //    formattedValue to match its current value ids. formattedValue is NOT part of the lean projection,
    //    so this dispatch never shifts `projectLean` → EMIT sees no divergence and never emits (no loop).
    useEffect(() => {
        (filtersData.filters as UIFilter[]).forEach(filter => {
            if (!isUIFilterWithSmartFilter(filter)) {
                return;
            }
            const labels = smartLabelsById[filter.id];
            if (!labels) {
                return;
            }
            const values = Array.isArray(filter.value) ? filter.value : filter.value != null ? [filter.value] : [];
            const nextFormatted = values.map(value => labels[value] ?? value);
            const current = filter.formattedValue ?? [];
            const unchanged =
                nextFormatted.length === current.length &&
                nextFormatted.every((label, index) => label === current[index]);
            if (!unchanged) {
                dispatch({
                    type: FiltersActionTypes.CHANGE_FILTER_CONFIG,
                    payload: {...filter, formattedValue: nextFormatted},
                });
            }
        });
    }, [smartLabelsById, filtersData.filters]);

    return {filtersData, dispatch};
};
