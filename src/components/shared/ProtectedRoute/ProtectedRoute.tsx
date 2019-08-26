import React, {ReactNode} from 'react';
import {Route, RouteComponentProps, RouteProps} from 'react-router-dom';
import useUserData from '../../../hooks/useUserData';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import ForbiddenRoute from '../ForbiddenRoute';

interface IProtectedRouteProps extends RouteProps {
    permissions?: PermissionsActions[];
    component: any; // TODO: Forced to any to avoid error, check this error on new typescript versions (> 3.3)
}

/* tslint:disable-next-line:variable-name */
function ProtectedRoute({component: Component, permissions, ...rest}: IProtectedRouteProps): JSX.Element {
    const userData = useUserData();

    const hasAccess =
        !permissions ||
        permissions.reduce(
            (isAuthorized: boolean, permName): boolean =>
                isAuthorized && !!userData.permissions && userData.permissions[permName],
            true
        );

    const render = (props: RouteComponentProps): ReactNode =>
        hasAccess ? <Component {...props} /> : <ForbiddenRoute />;

    return <Route {...rest} render={render} />;
}

export default ProtectedRoute;
