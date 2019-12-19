import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import styled from 'styled-components';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import Attributes from '../../attributes/Attributes';
import EditAttribute from '../../attributes/EditAttribute';
import EditLibrary from '../../libraries/EditLibrary';
import Libraries from '../../libraries/Libraries';
import AdminPermissions from '../../permissions/AdminPermissions';
import Plugins from '../../plugins';
import ProtectedRoute from '../../shared/ProtectedRoute';
import EditTree from '../../trees/EditTree';
import Trees from '../../trees/Trees';
import MainMenu from '../MainMenu';

/* tslint:disable-next-line:variable-name */
const LeftCol = styled.div`
    position: fixed;
    width: 250px;
    background-color: #1b1c1d;
    min-height: 100vh;
`;

/* tslint:disable-next-line:variable-name */
const Content = styled.div`
    margin-left: 250px;
    padding: 20px;
    min-height: 100vh;
`;

function Home(): JSX.Element {
    return (
        <Router>
            <div className="wrapper height100">
                <LeftCol>
                    <MainMenu />
                </LeftCol>
                <Content className="content flex-col height100" style={{overflowX: 'scroll'}}>
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
                        permissions={[PermissionsActions.admin_access_permissions]}
                        path="/permissions"
                        component={AdminPermissions}
                        exact
                    />
                    <ProtectedRoute path="/plugins" component={Plugins} exact />
                </Content>
            </div>
        </Router>
    );
}

export default Home;
