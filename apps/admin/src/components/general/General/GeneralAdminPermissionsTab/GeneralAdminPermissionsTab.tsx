// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import DefinePermByUserGroupView from 'components/permissions/DefinePermByUserGroupView';
import React from 'react';
import {PermissionsActions, PermissionTypes} from '_gqlTypes/globalTypes';
import {IGroupedPermissionsActions} from '_types/permissions';

function GeneralAdminPermissionsTab(): JSX.Element {
    const groupedPermissionsActions: IGroupedPermissionsActions = {
        libraries: [
            PermissionsActions.admin_access_libraries,
            PermissionsActions.admin_create_library,
            PermissionsActions.admin_delete_library,
            PermissionsActions.admin_edit_library
        ],
        attributes: [
            PermissionsActions.admin_access_attributes,
            PermissionsActions.admin_create_attribute,
            PermissionsActions.admin_delete_attribute,
            PermissionsActions.admin_edit_attribute
        ],
        trees: [
            PermissionsActions.admin_access_trees,
            PermissionsActions.admin_create_tree,
            PermissionsActions.admin_delete_tree,
            PermissionsActions.admin_edit_tree
        ],
        applications: [
            PermissionsActions.admin_access_applications,
            PermissionsActions.admin_create_application,
            PermissionsActions.admin_delete_application,
            PermissionsActions.admin_edit_application
        ],
        version_profiles: [
            PermissionsActions.admin_access_version_profiles,
            PermissionsActions.admin_create_version_profile,
            PermissionsActions.admin_delete_version_profile,
            PermissionsActions.admin_edit_version_profile
        ],
        permissions: [PermissionsActions.admin_access_permissions, PermissionsActions.admin_edit_permission],
        preferences: [PermissionsActions.admin_manage_global_preferences],
        tasks: [
            PermissionsActions.admin_access_tasks,
            PermissionsActions.admin_cancel_task,
            PermissionsActions.admin_delete_task
        ],
        api_keys: [
            PermissionsActions.admin_access_api_keys,
            PermissionsActions.admin_edit_api_key,
            PermissionsActions.admin_create_api_key,
            PermissionsActions.admin_delete_api_key
        ]
    };

    return <DefinePermByUserGroupView type={PermissionTypes.admin} actions={groupedPermissionsActions} />;
}

export default GeneralAdminPermissionsTab;
