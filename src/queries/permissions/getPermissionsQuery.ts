// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getPermissionsQuery = gql`
    query GET_PERMISSIONS(
        $type: PermissionTypes!
        $applyTo: ID
        $actions: [PermissionsActions!]!
        $usersGroup: ID
        $permissionTreeTarget: PermissionsTreeTargetInput
    ) {
        perm: permissions(
            type: $type
            applyTo: $applyTo
            actions: $actions
            usersGroup: $usersGroup
            permissionTreeTarget: $permissionTreeTarget
        ) {
            name
            allowed
        }
        heritPerm: heritedPermissions(
            type: $type
            applyTo: $applyTo
            actions: $actions
            userGroupId: $usersGroup
            permissionTreeTarget: $permissionTreeTarget
        ) {
            name
            allowed
        }
    }
`;
