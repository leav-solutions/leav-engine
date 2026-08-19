import {type FunctionComponent, type PropsWithChildren} from 'react';
import {generatePath, Navigate} from 'react-router-dom';
import {useRouteParams} from '../router/useRouteParams';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {AbsolutePaths, RelativePaths} from '../router/paths';
import {retrievePanelDetails} from '../utils/retrievePanelDetails';
import {isCreationPanel} from '../utils/isCreationPanel';

// Creation panels (LEAV form or delegated iframe) are always shown as top-level popups.
export const RedirectCreationPanelToPopup: FunctionComponent<PropsWithChildren> = ({children}) => {
    const [application] = useApplicationSettingsContext();
    const {panelId, recordId, where, recordPanelId} = useRouteParams();
    const {currentPanel} = retrievePanelDetails({application, recordPanelId, panelId});

    if (!currentPanel) {
        console.error(`Current panel not found for record panel with id ${recordPanelId}`);
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    const shouldRedirectToPopup = isCreationPanel(currentPanel) && where !== 'popup';

    if (!shouldRedirectToPopup) {
        return <>{children}</>;
    }

    return (
        <Navigate
            replace
            to={generatePath(RelativePaths.openCurrentPanelInPopup, {
                recordId,
                recordPanelId,
            })}
            relative="path"
        />
    );
};
