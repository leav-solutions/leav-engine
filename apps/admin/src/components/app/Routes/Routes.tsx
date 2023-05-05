// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import Loading from 'components/shared/Loading';
import ProtectedRoute from 'components/shared/ProtectedRoute';
import React, {Suspense} from 'react';
import {Route} from 'react-router-dom';
import {PermissionsActions} from '_gqlTypes/globalTypes';
import Dashboard from '../Dashboard';
import General from 'components/general/General';
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
