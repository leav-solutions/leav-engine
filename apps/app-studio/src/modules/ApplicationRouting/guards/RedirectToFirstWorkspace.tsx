import {type FunctionComponent} from 'react';
import {generatePath, Navigate} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {AbsolutePaths, UnreachablePaths} from '../router/paths';

export const RedirectToFirstWorkspace: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();

    const workspaceId = application?.workspaces?.[0]?.id;

    if (!workspaceId) {
        console.error('No workspace found');
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    return <Navigate replace to={generatePath(UnreachablePaths.workspace, {workspaceId})} />;
};
