import useUserData from '../../../hooks/useUserData';
import {PermissionsActions} from '../../../_gqlTypes';
import ForbiddenRoute from '../ForbiddenRoute';
import {useCurrentApplicationContext} from '../../../context/CurrentApplicationContext';

interface IProtectedRouteProps {
    permissions?: PermissionsActions[];
    component: any; // TODO: Forced to any to avoid error, check this error on new typescript versions (> 3.3)
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function ProtectedRoute({component: Component, permissions}: IProtectedRouteProps): JSX.Element {
    const userData = useUserData();

    // TODO: To remove when "displayNewAutomationModule" feature toggle is removed (https://aristid.atlassian.net/browse/LEAVC-747)
    const applicationData = useCurrentApplicationContext();
    const hasAccessToAutomation =
        !permissions.includes(PermissionsActions.admin_manage_automation) ||
        applicationData.currentApp.settings.displayNewAutomationModule;

    const hasAccess =
        !permissions ||
        (hasAccessToAutomation &&
            permissions.reduce(
                (isAuthorized: boolean, permName): boolean =>
                    isAuthorized && !!userData.permissions && userData.permissions[permName],
                true,
            ));

    return hasAccess ? <Component /> : <ForbiddenRoute />;
}

export default ProtectedRoute;
