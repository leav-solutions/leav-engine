import React from 'react';
import UserContext, {IUserContext} from '../../components/shared/UserContext/UserContext';
import {PermissionsActions} from '../../_gqlTypes/globalTypes';

const userData: IUserContext = {
    id: 1,
    name: 'Test',
    permissions: {
        [PermissionsActions.admin_access_attributes]: true,
        [PermissionsActions.admin_access_libraries]: true,
        [PermissionsActions.admin_access_permissions]: true,
        [PermissionsActions.admin_access_trees]: true,
        [PermissionsActions.admin_create_attribute]: true,
        [PermissionsActions.admin_create_library]: true,
        [PermissionsActions.admin_create_tree]: true,
        [PermissionsActions.admin_delete_attribute]: true,
        [PermissionsActions.admin_delete_library]: true,
        [PermissionsActions.admin_delete_tree]: true,
        [PermissionsActions.admin_edit_attribute]: true,
        [PermissionsActions.admin_edit_library]: true,
        [PermissionsActions.admin_edit_permission]: true,
        [PermissionsActions.admin_edit_tree]: true
    }
};

function MockedUserContextProvider({children}) {
    return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}

export default MockedUserContextProvider;
