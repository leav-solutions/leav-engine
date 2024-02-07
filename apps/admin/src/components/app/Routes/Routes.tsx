// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import Loading from 'components/shared/Loading';
import ProtectedRoute from 'components/shared/ProtectedRoute';
import React, {Suspense} from 'react';
import {Route} from 'react-router-dom-v5';
import {PermissionsActions} from '_gqlTypes/globalTypes';

const Dashboard = React.lazy(() => import('../Dashboard'));
const General = React.lazy(() => import('components/general/General'));
const Libraries = React.lazy(() => import('components/libraries/Libraries'));
const EditLibrary = React.lazy(() => import('components/libraries/EditLibrary'));
const Attributes = React.lazy(() => import('components/attributes/Attributes'));
const EditAttribute = React.lazy(() => import('components/attributes/EditAttribute'));
const Trees = React.lazy(() => import('components/trees/Trees'));
const EditTree = React.lazy(() => import('components/trees/EditTree'));
const Applications = React.lazy(() => import('components/applications/Applications'));
const EditApplication = React.lazy(() => import('components/applications/EditApplication'));
const VersionProfiles = React.lazy(() => import('components/versionProfiles/VersionProfiles'));
const EditVersionProfile = React.lazy(() => import('components/versionProfiles/EditVersionProfile'));
const Tasks = React.lazy(() => import('components/tasks/Tasks'));

function Routes(): JSX.Element {
    return (
        <>
            <Suspense fallback={<Loading />}>
                <Route path="/" component={Dashboard} exact />
                <Route path="/general" component={General} exact />
                <ProtectedRoute
                    permissions={[PermissionsActions.admin_access_libraries]}
                    path="/libraries"
                    component={Libraries}
                    exact
                />
                <ProtectedRoute
                    permissions={[PermissionsActions.admin_access_libraries]}
                    path="/libraries/edit/:id?"
                    component={EditLibrary}
                    exact
                />
                <ProtectedRoute
                    permissions={[PermissionsActions.admin_access_attributes]}
                    path="/attributes"
                    component={Attributes}
                    exact
                />
                <ProtectedRoute
                    permissions={[PermissionsActions.admin_access_attributes]}
                    path="/attributes/edit/:id?"
                    component={EditAttribute}
                    exact
                />
                <ProtectedRoute
                    permissions={[PermissionsActions.admin_access_trees]}
                    path="/trees"
                    component={Trees}
                    exact
                />
                <ProtectedRoute
                    permissions={[PermissionsActions.admin_access_trees]}
                    path="/trees/edit/:id?"
                    component={EditTree}
                    exact
                />
                <ProtectedRoute
                    permissions={[PermissionsActions.admin_access_applications]}
                    path="/applications"
                    component={Applications}
                    exact
                />
                <ProtectedRoute
                    permissions={[PermissionsActions.admin_access_applications]}
                    path="/applications/edit/:id?"
                    component={EditApplication}
                    exact
                />
                <ProtectedRoute
                    permissions={[PermissionsActions.admin_access_version_profiles]}
                    path="/version_profiles"
                    component={VersionProfiles}
                    exact
                />
                <ProtectedRoute
                    permissions={[PermissionsActions.admin_access_version_profiles]}
                    path="/version_profiles/edit/:id?"
                    component={EditVersionProfile}
                />
                <ProtectedRoute
                    permissions={[PermissionsActions.admin_access_tasks]}
                    path="/tasks"
                    component={Tasks}
                    exact
                />
            </Suspense>
        </>
    );
}

export default Routes;
