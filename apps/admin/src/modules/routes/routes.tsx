// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type RouteObject} from 'react-router-dom';
import {AdminAbsolutePaths, AdminUnreachablePaths} from './paths';
import {PermissionsActions} from '_gqlTypes';
import Dashboard from 'components/app/Dashboard';
import General from 'components/general/General';
import ProtectedRoute from 'components/shared/ProtectedRoute';
import Libraries from 'components/libraries/Libraries';
import EditLibrary from 'components/libraries/EditLibrary';
import Attributes from 'components/attributes/Attributes';
import EditAttribute from 'components/attributes/EditAttribute';
import Trees from 'components/trees/Trees';
import EditTree from 'components/trees/EditTree';
import Applications from 'components/applications/Applications';
import EditApplication from 'components/applications/EditApplication';
import VersionProfiles from 'components/versionProfiles/VersionProfiles';
import EditVersionProfile from 'components/versionProfiles/EditVersionProfile';
import Tasks from 'components/tasks/Tasks';
import {History} from '../history/History';
import {NotFound} from '../not-found/NotFound';

// Note:
// - For historic routes, we don't use the children routes feature as they don't have an <Outlet/> and are not nested
export const adminRoutes: RouteObject[] = [
    {
        path: AdminAbsolutePaths.root,
        element: <Dashboard />,
    },
    {
        path: AdminAbsolutePaths.general,
        element: <General />,
    },
    {
        path: AdminAbsolutePaths.libraries,
        element: <ProtectedRoute permissions={[PermissionsActions.admin_access_libraries]} component={Libraries} />,
    },
    {
        path: `${AdminAbsolutePaths.libraries}/${AdminUnreachablePaths.edit}`,
        element: <ProtectedRoute permissions={[PermissionsActions.admin_access_libraries]} component={EditLibrary} />,
    },
    {
        path: AdminAbsolutePaths.attributes,
        element: <ProtectedRoute permissions={[PermissionsActions.admin_access_attributes]} component={Attributes} />,
    },
    {
        path: `${AdminAbsolutePaths.attributes}/${AdminUnreachablePaths.edit}`,
        element: (
            <ProtectedRoute permissions={[PermissionsActions.admin_access_attributes]} component={EditAttribute} />
        ),
    },
    {
        path: AdminAbsolutePaths.trees,
        element: <ProtectedRoute permissions={[PermissionsActions.admin_access_trees]} component={Trees} />,
    },
    {
        path: `${AdminAbsolutePaths.trees}/${AdminUnreachablePaths.edit}`,
        element: <ProtectedRoute permissions={[PermissionsActions.admin_access_trees]} component={EditTree} />,
    },
    {
        path: AdminAbsolutePaths.applications,
        element: (
            <ProtectedRoute permissions={[PermissionsActions.admin_access_applications]} component={Applications} />
        ),
    },
    {
        path: `${AdminAbsolutePaths.applications}/${AdminUnreachablePaths.edit}`,
        element: (
            <ProtectedRoute permissions={[PermissionsActions.admin_access_applications]} component={EditApplication} />
        ),
    },
    {
        path: AdminAbsolutePaths.version_profiles,
        element: (
            <ProtectedRoute
                permissions={[PermissionsActions.admin_access_version_profiles]}
                component={VersionProfiles}
            />
        ),
    },
    {
        path: `${AdminAbsolutePaths.version_profiles}/${AdminUnreachablePaths.edit}`,
        element: (
            <ProtectedRoute
                permissions={[PermissionsActions.admin_access_version_profiles]}
                component={EditVersionProfile}
            />
        ),
    },
    {
        path: AdminAbsolutePaths.tasks,
        element: <ProtectedRoute permissions={[PermissionsActions.admin_access_tasks]} component={Tasks} />,
    },
    {
        path: AdminAbsolutePaths.logs,
        element: <ProtectedRoute permissions={[PermissionsActions.admin_access_logs]} component={History} />,
    },
    {
        path: AdminAbsolutePaths.notFound,
        element: <NotFound />,
    },
];
