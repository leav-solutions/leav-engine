// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import DefinePermByUserGroupView from 'components/permissions/DefinePermByUserGroupView';
import React from 'react';
import {PermissionsActions, PermissionTypes} from '_gqlTypes/globalTypes';
import {IGroupedPermissionsActions} from '_types/permissions';

function GeneralAdminPermissionsTab(): JSX.Element {
    const groupedPermissionsActions: IGroupedPermissionsActions = {
        libraries: [
            PermissionsActions.app_access_libraries,
            PermissionsActions.app_create_library,
            PermissionsActions.app_delete_library,
            PermissionsActions.app_edit_library
        ],
        attributes: [
            PermissionsActions.app_access_attributes,
            PermissionsActions.app_create_attribute,
            PermissionsActions.app_delete_attribute,
            PermissionsActions.app_edit_attribute
        ],
        trees: [
            PermissionsActions.app_access_trees,
            PermissionsActions.app_create_tree,
            PermissionsActions.app_delete_tree,
            PermissionsActions.app_edit_tree
        ],
        permissions: [PermissionsActions.app_access_permissions, PermissionsActions.app_edit_permission],
        preferences: [PermissionsActions.app_manage_global_preferences]
    };

    return <DefinePermByUserGroupView type={PermissionTypes.app} actions={groupedPermissionsActions} />;
}

export default GeneralAdminPermissionsTab;
