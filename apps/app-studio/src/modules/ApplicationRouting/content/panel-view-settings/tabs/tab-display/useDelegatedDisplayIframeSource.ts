import {useMemo} from 'react';
import {useRouteParams} from '../../../../router/useRouteParams';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {useApplicationSettingsContext} from '../../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {retrievePanelDetails} from '../../../../utils/retrievePanelDetails';

/**
 * Resolves the URL of the iframe that a custom panel delegates its Display tab to
 * (`displayViewSettingsIframeSource`), or `undefined` when the Display tab is native.
 *
 * A custom view (origin set) delegates its display config to the panel's own iframe: it owns the
 * display mode and its settings. An explorer view (no origin) keeps the native Display tab, so the
 * source resolves only when origin is set. Shared by `TabDisplay` (to render the iframe) and
 * `PanelViewSettings` (to drop the tab content padding around that iframe).
 */
export const useDelegatedDisplayIframeSource = (): string | undefined => {
    const {origin} = useCurrentView();
    const applicationCtx = useApplicationSettingsContext();
    const {panelId, recordPanelId} = useRouteParams();

    return useMemo(() => {
        const application = applicationCtx?.[0];
        if (!origin || !application) {
            return undefined;
        }
        const {currentPanel} = retrievePanelDetails({application, recordPanelId, panelId});
        return currentPanel?.type === 'custom' ? currentPanel.displayViewSettingsIframeSource : undefined;
    }, [applicationCtx, origin, recordPanelId, panelId]);
};
