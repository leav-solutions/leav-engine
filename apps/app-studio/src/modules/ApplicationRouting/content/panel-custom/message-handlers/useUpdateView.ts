import {type IUsePanelMessengerOptions} from '_ui/hooks/usePanelMessenger/types';
import {RecordFilterCondition} from '../../../../../__generated__';
import {useCurrentView} from '../../panel-view-settings/store-current-view/useCurrentView';

/**
 * Cross-frame → host bridge: a custom panel iframe (e.g. planning) pushes its view edits (opaque
 * display settings and/or the whole lean filter set) up to the current-view hub. Reconciliation mirrors
 * `useViewSettingsProps.onFiltersChange` so the hub↔iframe round-trip converges (G1/G3 guards):
 * update present filters, unpin a pinned filter that vanished from the incoming set.
 *
 * Safe to call outside a `CurrentViewStoreProvider` (a plain custom panel without view settings):
 * `view` is null there and every branch is skipped, so no dispatch ever fires.
 */
export const useUpdateView = (): {updateView: IUsePanelMessengerOptions['handlers']['onUpdateView']} => {
    const {view, setDisplaySettings, setFilterConfig, toggleFilterPinned, pinnedFilters} = useCurrentView();

    return {
        updateView: data => {
            if (!view) {
                return;
            }

            if (data.displaySettings !== undefined) {
                setDisplaySettings(data.displaySettings ?? null);
            }

            if (data.filters !== undefined) {
                const leanFilters = data.filters.filter(filter => filter.hidden !== true);
                const incomingIds = new Set(
                    leanFilters.map(filter => filter.attributes.map(attribute => attribute.id).join('/')),
                );
                leanFilters.forEach(filter => {
                    const id = filter.attributes.map(attribute => attribute.id).join('/');
                    setFilterConfig(
                        id,
                        filter.condition ?? RecordFilterCondition.EQUAL,
                        filter.values,
                        filter.withEmptyValues,
                    );
                });
                pinnedFilters.forEach(pinnedFilter => {
                    if (!incomingIds.has(pinnedFilter.id)) {
                        toggleFilterPinned(pinnedFilter.id);
                    }
                });
            }
        },
    };
};
