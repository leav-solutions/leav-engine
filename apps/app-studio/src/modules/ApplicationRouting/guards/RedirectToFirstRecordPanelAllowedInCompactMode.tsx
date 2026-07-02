import {type FunctionComponent, type PropsWithChildren} from 'react';
import {generatePath, Navigate, useParams} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {AbsolutePaths, RelativePaths} from '../router/paths';
import {retrievePanelDetails} from '../utils/retrievePanelDetails';

export const RedirectToFirstRecordPanelAllowedInCompactMode: FunctionComponent<PropsWithChildren> = ({children}) => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();

    const {currentPanel, libraryId} = retrievePanelDetails({application, recordPanelId, panelId});

    if (!currentPanel) {
        console.error(`Current panel not found for record panel with id ${recordPanelId}`);
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    const currentPanelShouldBeHidden = currentPanel.hideInCompactMode && ['slider', 'popup'].includes(where);
    if (!currentPanelShouldBeHidden) {
        return <>{children}</>;
    }

    if (!libraryId) {
        console.error(`Library not found for panel with id ${recordPanelId}`);
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    const firstRecordPanelAllowedInCompactMode = application.libraries[libraryId].recordPanels.find(
        panel => !panel.hideInCompactMode,
    );

    if (!firstRecordPanelAllowedInCompactMode) {
        console.error('No record panel allowed in slider found');
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    return (
        <Navigate
            replace
            to={generatePath(RelativePaths.changeLastRecordPanel, {
                recordPanelId: firstRecordPanelAllowedInCompactMode.id,
            })}
            relative="path"
        />
    );
};
