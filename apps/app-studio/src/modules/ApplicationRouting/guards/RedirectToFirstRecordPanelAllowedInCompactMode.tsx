// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {generatePath, Navigate, useParams} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {AbsolutePaths, RelativePaths} from '../router/paths';
import {retrievePanelDetails} from '../utils/retrievePanelDetails';

export const RedirectToFirstRecordPanelAllowedInCompactMode: FunctionComponent = ({children}) => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();

    const {currentPanel} = retrievePanelDetails({application, recordPanelId, panelId});

    if (!currentPanel) {
        console.error(`Current panel not found for record panel with id ${recordPanelId}`);
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    const currentPanelShouldBeHidden = currentPanel.hideInCompactMode && ['slider', 'popup'].includes(where);
    if (!currentPanelShouldBeHidden) {
        return <>{children}</>;
    }

    const workspace = application.workspaces.find(({id}) => id === workspaceId);

    if (!workspace) {
        console.error(`Workspace not found for record panel with id ${recordPanelId}`);
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    const firstRecordPanelAllowedInCompactMode = application.libraries[workspace.libraryId].recordPanels.find(
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
