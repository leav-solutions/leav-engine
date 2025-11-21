// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {generatePath, Navigate, useParams} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {AbsolutePaths} from '../router/paths';

export const RedirectToFirstPanel: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId} = useParams();

    // TODO: handle case where workspaceId is undefined, should redirect to 404
    const workspace = application.workspaces.find(({id}) => id === workspaceId);

    const panelId =
        workspace.type === 'library'
            ? application.libraries[workspace.libraryId].libraryPanels[0].id
            : application.libraries[workspace.libraryId].recordPanels[0].id;

    return <Navigate replace to={generatePath(AbsolutePaths.panel, {workspaceId, panelId})} />;
};
