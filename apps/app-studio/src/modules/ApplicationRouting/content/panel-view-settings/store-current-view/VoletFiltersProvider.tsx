import {type ReactNode, useCallback, useMemo} from 'react';
import {FiltersContext, type SerializedFilter, type UIFilter, useControlledFilterStore} from '@leav/ui';
import {RecordFilterCondition} from '../../../../../__generated__';
import {useCurrentView} from './useCurrentView';

const DEFAULT_FILTER_CONDITION = RecordFilterCondition.EQUAL;

const emptyHiddenFilters: UIFilter[] = [];

/**
 * Spoke A of the filters hub & spoke (ADR-006 / LEAVC-810). Mounts a `FiltersContext` scoped to the
 * view-settings VOLET only — NEVER shared with ExplorerV2 (which owns a separate store fed by the same
 * hub). It rebuilds a rich `UIFilter` store from the hub's PINNED lean filters via the shared
 * `useControlledFilterStore`, and writes value edits back to the hub through `setFilterConfig`. Structure
 * (pin/unpin/order/availability) and tree shape still flow through the `useCurrentView` dispatchers
 * unchanged — this provider only mediates filter VALUES.
 *
 * `hiddenFilters` (optional): the masked pre-filters passed in by `ViewSettingsContainer`. For an
 * `explorer` panel these are built from `attributeSource` (cf. `PanelAttributeExplorer.tsx`'s
 * `linkPreFilter`); for a `custom` panel the iframe pushes them via the `open-view-settings` message.
 * The hub never carries them (they're not part of the persisted view), so they must be merged in here too
 * — otherwise a
 * smart-filter dropdown opened from the volet computes its `listDistinctValues` unscoped, same class of
 * bug as ExplorerV2's own store. `useFilters()` already excludes `hidden` filters from display, so this
 * is display-safe (mirrors the fix applied to ExplorerV2's own `FiltersContext.Provider`).
 */
export const VoletFiltersProvider = ({
    children,
    hiddenFilters = emptyHiddenFilters,
}: {
    children: ReactNode;
    hiddenFilters?: UIFilter[];
}) => {
    const {view, setFilterConfig} = useCurrentView();

    // Seed the store with ALL view filters (pinned AND unpinned): the Filters tab renders the pinned ones
    // in the editable `CommonFilterItem` and the unpinned ones in a read-only `CommonFilterItem` — both
    // need a fully-built `UIFilter` from this store. `setFilterConfig` is pin-agnostic (it never flips
    // `pinned`), so seeding unpinned filters can't alter their pin state.
    const leanFilters = useMemo<SerializedFilter[]>(
        () =>
            (view?.filters ?? []).map(filter => ({
                attributes: filter.attributes.map(attribute => ({id: attribute.id, label: attribute.label})),
                condition: filter.condition,
                values: filter.values,
                pinned: filter.pinned,
                withEmptyValues: filter.withEmptyValues ?? false,
            })),
        [view],
    );

    // A volet value edit hands back the whole lean set; reconcile it into the hub filter by filter.
    // `setFilterConfig` is a no-op for unchanged filters (G1), and `useControlledFilterStore` only emits
    // on a genuine local edit (echo-suppressed), so this never loops.
    const handleChange = useCallback(
        (filters: SerializedFilter[]) => {
            filters.forEach(filter => {
                const id = filter.attributes.map(attribute => attribute.id).join('/');
                setFilterConfig(
                    id,
                    filter.condition ?? DEFAULT_FILTER_CONDITION,
                    filter.values,
                    filter.withEmptyValues,
                );
            });
        },
        [setFilterConfig],
    );

    const {filtersData, dispatch} = useControlledFilterStore({
        leanFilters,
        libraryId: view?.library ?? null,
        viewId: view?.id ?? null,
        onChange: handleChange,
    });

    const filtersDataWithHidden = useMemo(
        () => ({...filtersData, filters: [...hiddenFilters, ...(filtersData.filters as UIFilter[])]}),
        [filtersData, hiddenFilters],
    );

    return (
        <FiltersContext.Provider value={{filtersData: filtersDataWithHidden, dispatch}}>
            {children}
        </FiltersContext.Provider>
    );
};
