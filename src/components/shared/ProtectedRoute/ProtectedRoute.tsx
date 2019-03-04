import React, {ReactNode, useContext} from 'react';
import {Route, RouteComponentProps, RouteProps} from 'react-router-dom';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import ForbiddenRoute from '../ForbiddenRoute';
import UserContext from '../UserContext';

interface IProtectedRouteProps extends RouteProps {
    permissions?: PermissionsActions[];
    component: any; // TODO: Forced to any to avoid error, check this error on new typescript versions (> 3.3)
}

/* tslint:disable-next-line:variable-name */
function ProtectedRoute({component: Component, permissions, ...rest}: IProtectedRouteProps): JSX.Element {
    const userData = useContext(UserContext);

    const hasAccess =
        !permissions ||
        permissions.reduce(
            (isAuthorized, permName) => isAuthorized && !!userData.permissions && userData.permissions[permName],
            true
        );

    const render = (props: RouteComponentProps): ReactNode =>
        hasAccess ? <Component {...props} /> : <ForbiddenRoute />;

    return <Route {...rest} render={render} />;
}

export default ProtectedRoute;
