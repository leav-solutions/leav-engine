// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useUserData from '../../../hooks/useUserData';
import {type PermissionsActions} from '../../../_gqlTypes';
import ForbiddenRoute from '../ForbiddenRoute';

interface IProtectedRouteProps {
    permissions?: PermissionsActions[];
    component: any; // TODO: Forced to any to avoid error, check this error on new typescript versions (> 3.3)
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function ProtectedRoute({component: Component, permissions}: IProtectedRouteProps): JSX.Element {
    const userData = useUserData();

    const hasAccess =
        !permissions ||
        permissions.reduce(
            (isAuthorized: boolean, permName): boolean =>
                isAuthorized && !!userData.permissions && userData.permissions[permName],
            true,
        );

    return hasAccess ? <Component /> : <ForbiddenRoute />;
}

export default ProtectedRoute;
