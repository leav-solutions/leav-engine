import {type FunctionComponent} from 'react';
import {generatePath, Navigate, useParams} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {AbsolutePaths} from '../router/paths';

export const RedirectToFirstPanel: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId} = useParams();

    const workspace = application.workspaces.find(({id}) => id === workspaceId);

    if (!workspace) {
        console.error(`Workspace with id ${workspaceId} not found`);
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    const panelId =
        workspace.type === 'library'
            ? application.libraries[workspace.libraryId].libraryPanels?.[0]?.id
            : application.libraries[workspace.libraryId].recordPanels?.[0]?.id;

    if (!panelId) {
        console.error(`No panel found for workspace with id ${workspaceId}`);
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    return <Navigate replace to={generatePath(AbsolutePaths.panel, {workspaceId, panelId})} />;
};
