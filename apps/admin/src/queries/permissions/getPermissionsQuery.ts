// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getPermissionsQuery = gql`
    query GET_PERMISSIONS(
        $type: PermissionTypes!
        $applyTo: ID
        $actions: [PermissionsActions!]!
        $usersGroup: ID
        $permissionTreeTarget: PermissionsTreeTargetInput
        $dependenciesTreeTargets: [PermissionsDependenciesTreeTargetInput!]
    ) {
        perm: permissions(
            type: $type
            applyTo: $applyTo
            actions: $actions
            usersGroup: $usersGroup
            permissionTreeTarget: $permissionTreeTarget
            dependenciesTreeTargets: $dependenciesTreeTargets
        ) {
            name
            allowed
        }
        inheritPerm: inheritedPermissions(
            type: $type
            applyTo: $applyTo
            actions: $actions
            userGroupNodeId: $usersGroup
            permissionTreeTarget: $permissionTreeTarget
            dependenciesTreeTargets: $dependenciesTreeTargets
        ) {
            name
            allowed
        }
    }
`;
