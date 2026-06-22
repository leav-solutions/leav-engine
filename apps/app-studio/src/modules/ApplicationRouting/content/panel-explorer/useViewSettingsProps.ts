import {type ComponentProps, useContext} from 'react';
import {useParams} from 'react-router-dom';
import {type ExplorerV2, type SerializedViewV2, usePanelEventHandlers} from '@leav/ui';
import {retrievePanelDetails} from '../../utils/retrievePanelDetails';
import {useApplicationSettingsContext} from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type AppStudioInternalEvent} from '../../types';
import {CurrentViewContext} from '../panel-view-settings/store-current-view/CurrentViewContext';

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

    const {currentPanel, libraryId, panelType, displayedLibraryId} = retrievePanelDetails({
        application,
        recordPanelId,
        panelId,
    });

    const {serializedView} = useContext(CurrentViewContext);
    const {dispatch} = usePanelEventHandlers<AppStudioInternalEvent>();

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
                        type: 'open-view-settings',
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
                onFiltersChange: () => {
                    // TODO: dispatch event to update currentView (deferred ticket — filters WIP)
                },
            },
        },
    };
};
