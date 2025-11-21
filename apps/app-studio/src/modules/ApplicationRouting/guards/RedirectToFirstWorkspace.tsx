// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {generatePath, Navigate} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {UnreachablePaths} from '../router/paths';

export const RedirectToFirstWorkspace: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();

    const workspaceId = application.workspaces[0].id;

    return <Navigate replace to={generatePath(UnreachablePaths.workspace, {workspaceId})} />;
};
