import {type ReactNode, useCallback, useMemo} from 'react';
import {FiltersContext, type SerializedFilter, useControlledFilterStore} from '@leav/ui';
import {RecordFilterCondition} from '../../../../../__generated__';
import {useCurrentView} from './useCurrentView';

const DEFAULT_FILTER_CONDITION = RecordFilterCondition.EQUAL;

/**
 * Spoke A of the filters hub & spoke (ADR-006 / LEAVC-810). Mounts a `FiltersContext` scoped to the
 * view-settings VOLET only — NEVER shared with ExplorerV2 (which owns a separate store fed by the same
 * hub). It rebuilds a rich `UIFilter` store from the hub's PINNED lean filters via the shared
 * `useControlledFilterStore`, and writes value edits back to the hub through `setFilterConfig`. Structure
 * (pin/unpin/order/availability) and tree shape still flow through the `useCurrentView` dispatchers
 * unchanged — this provider only mediates filter VALUES.
 */
export const VoletFiltersProvider = ({children}: {children: ReactNode}) => {
    const {view, setFilterConfig} = useCurrentView();

    const pinnedLeanFilters = useMemo<SerializedFilter[]>(
        () =>
            (view?.filters ?? [])
                .filter(filter => filter.pinned)
                .map(filter => ({
                    attributes: filter.attributes.map(attribute => ({id: attribute.id, label: attribute.label})),
                    condition: filter.condition,
                    values: filter.values,
                    pinned: true,
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
                setFilterConfig(id, filter.condition ?? DEFAULT_FILTER_CONDITION, filter.values);
            });
        },
        [setFilterConfig],
    );

    const {filtersData, dispatch} = useControlledFilterStore({
        leanFilters: pinnedLeanFilters,
        libraryId: view?.library ?? null,
        viewId: view?.id ?? null,
        onChange: handleChange,
    });

    return <FiltersContext.Provider value={{filtersData, dispatch}}>{children}</FiltersContext.Provider>;
};
