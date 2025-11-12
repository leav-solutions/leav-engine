// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {generatePath, Navigate, useParams} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/ApplicationSettingsContext';
import {AbsolutePaths} from '../router/paths';
import {retrievePanelDetails} from '../utils/retrievePanelDetails';

export const RedirectToFirstRecordPanelAllowedInSlider: FunctionComponent = ({children}) => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();

    const {currentPanel} = retrievePanelDetails({application, recordPanelId, panelId});

    if (!currentPanel.hideInSlider || where !== 'slider') {
        return <>{children}</>;
    }

    // TODO: handle case where workspaceId is undefined, should redirect to 404
    const workspace = application.workspaces.find(({id}) => id === workspaceId);

    const firstRecordPanelAllowedInSlider = application.libraries[workspace.libraryId].recordPanels.find(
        panel => !panel.hideInSlider,
    );

    if (!firstRecordPanelAllowedInSlider) {
        // TODO: handle case where no record panel is allowed in slider
        console.error('No record panel allowed in slider found');
        return <>{children}</>;
    }

    return (
        <Navigate
            replace
            to={generatePath(AbsolutePaths.recordPanel, {
                workspaceId,
                panelId,
                recordId,
                where,
                recordPanelId: firstRecordPanelAllowedInSlider.id,
            })}
        />
    );
};
