import gql from 'graphql-tag';

export const savePermissionsQuery = gql`
    mutation SAVE_PERMISSION($permData: PermissionInput!) {
        savePermission(permission: $permData) {
            type
            applyTo
            usersGroup
            actions {
                name
                allowed
            }
            permissionTreeTarget {
                id
                tree
                library
            }
        }
    }
`;
