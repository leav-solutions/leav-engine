import {type FunctionComponent} from 'react';
import {generatePath, Navigate} from 'react-router-dom';
import {useRouteParams} from '../router/useRouteParams';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {AbsolutePaths} from '../router/paths';
import {getTreeWorkspacePanelId} from '../utils/treeWorkspacePanel';

export const RedirectToFirstPanel: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId} = useRouteParams();

    const workspace = application.workspaces.find(({id}) => id === workspaceId);

    if (!workspace) {
        console.error(`Workspace with id ${workspaceId} not found`);
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    let panelId: string | undefined;
    if (workspace.type === 'tree') {
        panelId = getTreeWorkspacePanelId(workspace.id);
    } else if (workspace.type === 'library') {
        panelId = application.libraries[workspace.libraryId].libraryPanels?.[0]?.id;
    } else {
        panelId = application.libraries[workspace.libraryId].recordPanels?.[0]?.id;
    }

    if (!panelId) {
        console.error(`No panel found for workspace with id ${workspaceId}`);
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    return <Navigate replace to={generatePath(AbsolutePaths.panel, {workspaceId, panelId})} />;
};
