import {useParams} from 'react-router-dom';
import {usePanelEventHandlers} from '@leav/ui';
import {type IUsePanelMessengerOptions} from '_ui/hooks/usePanelMessenger/types';
import {useApplicationSettingsContext} from '../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {retrievePanelDetails} from '../../../utils/retrievePanelDetails';
import {type AppStudioInternalEvent} from '../../../types';

/**
 * Cross-frame → host bridge: a custom panel iframe (e.g. planning) asks the host to open the generic
 * view-settings volet on a given view. Resolves the current panel from the route, then dispatches the
 * INTERNAL `set-panel-view-settings` event (handled by `InitApplicationSettingProvider`) — the same
 * event the explorer emits on its gear click. Note the deliberate rename: the incoming cross-frame
 * message is `open-view-settings`, so the internal event it triggers MUST use a different type or the
 * raw iframe message (no `explorerPanelDetails`) would be caught directly by the internal registry.
 * Mirror of `useViewSettingsProps`' `onViewSettingsShortcutClick`.
 */
export const useOpenViewSettings = (): {
    openViewSettings: IUsePanelMessengerOptions['handlers']['onOpenViewSettings'];
} => {
    const [application] = useApplicationSettingsContext();
    const {panelId, recordPanelId} = useParams();
    const {dispatch} = usePanelEventHandlers<AppStudioInternalEvent>();

    return {
        openViewSettings: ({
            viewId,
            libraryId,
            selectedTab,
            displayViewSettingsIframeSource,
            hiddenTabs,
            hiddenFilters,
        }) => {
            const {
                currentPanel,
                libraryId: ownerLibraryId,
                panelType,
            } = retrievePanelDetails({
                application,
                recordPanelId,
                panelId,
            });

            if (currentPanel === null || ownerLibraryId === null || panelType === null) {
                return;
            }

            dispatch({
                type: 'set-panel-view-settings',
                data: {
                    selectedTab: selectedTab ?? 'display',
                    currentViewId: viewId,
                    currentLibraryId: libraryId,
                    displayViewSettingsIframeSource,
                    hiddenTabs,
                    hiddenFilters,
                    explorerPanelDetails: {libraryId: ownerLibraryId, panelType, panelId: currentPanel.id},
                },
            });
        },
    };
};
