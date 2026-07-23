import {type ComponentProps, useCallback, useContext} from 'react';
import {useParams} from 'react-router-dom';
import {type ExplorerV2, type SerializedFilter, type SerializedViewV2, useLang, usePanelEventHandlers} from '@leav/ui';
import {retrievePanelDetails} from '../../utils/retrievePanelDetails';
import {useApplicationSettingsContext} from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type AppStudioInternalEvent} from '../../types';
import {CurrentViewContext} from '../panel-view-settings/store-current-view/CurrentViewContext';
import {useCurrentView} from '../panel-view-settings/store-current-view/useCurrentView';
import {matomo} from '../../../../services/analytics';
import {matomoEvents} from '../../../../services/analytics/constants/matomoEvents';
import {reconcileToolbarFilters} from './reconcileToolbarFilters';

/**
 * app-studio is the source of truth for views (ADR-006): the `CurrentViewStoreProvider` (mounted in
 * `Panel`) resolves the current viewV2 and exposes it serialized via `CurrentViewContext`. This hook
 * just reads that serialized view to feed ExplorerV2's controlled `currentView` prop — it never
 * queries a viewV2 itself.
 */
export const useViewSettingsProps = (): {
    currentView?: SerializedViewV2;
    defaultCallbacks?: ComponentProps<typeof ExplorerV2>['defaultCallbacks'];
} => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();
    const {lang} = useLang();

    const {currentPanel, libraryId, panelType, displayedLibraryId} = retrievePanelDetails({
        application,
        recordPanelId,
        panelId,
    });

    const {serializedView} = useContext(CurrentViewContext);
    const {dispatch} = usePanelEventHandlers<AppStudioInternalEvent>();
    const {setFilterConfig, rePathFilter, toggleFilterPinned, filters: hubFilters} = useCurrentView();

    // Reconcile the WHOLE lean set emitted by ExplorerV2's filter store against the hub (see
    // `reconcileToolbarFilters`): update present filters (setConfig); re-path a filter whose attribute
    // path changed in place (bare link → through, or sub-attribute swap) so its chip survives instead
    // of being dropped; unpin a pinned filter that genuinely vanished from the toolbar. The store's
    // echo-suppression (G3) guarantees this only fires on a genuine toolbar edit/removal, and the
    // reducer guards (G1) are no-ops for unchanged filters, so the hub↔spoke round-trip converges.
    const onFiltersChange = useCallback(
        ({filters}: {filters: SerializedFilter[]}) => {
            const ops = reconcileToolbarFilters(
                filters,
                hubFilters.map(filter => ({id: filter.id, pinned: filter.pinned})),
            );
            ops.forEach(op => {
                switch (op.type) {
                    case 'setConfig':
                        setFilterConfig(op.id, op.condition, op.values, op.withEmptyValues);
                        break;
                    case 'rePath':
                        rePathFilter(op.oldId, op.attributes, op.condition, op.values, op.withEmptyValues);
                        break;
                    case 'unpin':
                        toggleFilterPinned(op.id);
                        break;
                }
            });

            if (currentPanel !== null) {
                const filterInteractionAction =
                    filters.length === 0 ? matomoEvents.actions.filter_reset : matomoEvents.actions.filter_applied;
                matomo.trackInteractionEvent(filterInteractionAction, currentPanel, lang);
            }
        },
        [setFilterConfig, rePathFilter, toggleFilterPinned, hubFilters, currentPanel, lang],
    );

    if (!application.enableViewSettings) {
        return {};
    }

    // Fallback for a library with no resolvable view, so the Explorer can still render.
    const defaultView: SerializedViewV2 = {viewType: undefined, attributesIds: [], filters: []};

    // The live (unsaved) view from the store overrides nothing else: it already reflects the loaded
    // view once fetched, and the user's in-progress edits while the volet is open.
    const currentView = serializedView ?? defaultView;

    return {
        currentView,
        defaultCallbacks: {
            viewSettings: {
                onFiltersChange,
                onViewSettingsShortcutClick: ({settingName, viewId: clickedViewId}) => {
                    if (
                        currentPanel === null ||
                        libraryId === null ||
                        displayedLibraryId === null ||
                        panelType === null ||
                        currentPanel.type !== 'explorer'
                    ) {
                        return;
                    }

                    dispatch({
                        type: 'set-panel-view-settings',
                        data: {
                            selectedTab: settingName,
                            currentViewId: clickedViewId,
                            // The volet works on the library the explorer DISPLAYS (the linked library
                            // for a record-panel link explorer), not the owner library under which the
                            // panel is configured — the latter is only used to locate the panel below.
                            currentLibraryId: displayedLibraryId,
                            explorerPanelDetails: {
                                libraryId,
                                panelType,
                                panelId: currentPanel.id,
                            },
                        },
                    });
                },
            },
            mass: {
                export: () => {
                    if (currentPanel !== null) {
                        matomo.trackInteractionEvent(matomoEvents.actions.content_exported, currentPanel, lang);
                    }
                },
            },
        },
    };
};
