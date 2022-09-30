// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Applications from 'components/applications/Applications';
import EditApplication from 'components/applications/EditApplication';
import Attributes from 'components/attributes/Attributes';
import EditAttribute from 'components/attributes/EditAttribute';
import General from 'components/general/General';
import EditLibrary from 'components/libraries/EditLibrary';
import Libraries from 'components/libraries/Libraries';
import ProtectedRoute from 'components/shared/ProtectedRoute';
import EditTree from 'components/trees/EditTree';
import Trees from 'components/trees/Trees';
import EditVersionProfile from 'components/versionProfiles/EditVersionProfile';
import VersionProfiles from 'components/versionProfiles/VersionProfiles';
import React from 'react';
import {Route} from 'react-router-dom';
import {PermissionsActions} from '_gqlTypes/globalTypes';
import Dashboard from '../Dashboard';

function Routes(): JSX.Element {
    return (
        <>
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
                exact
            />
        </>
    );
}

export default Routes;
