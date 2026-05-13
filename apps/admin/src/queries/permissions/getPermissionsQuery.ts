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
