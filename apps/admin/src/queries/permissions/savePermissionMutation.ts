import {gql} from '@apollo/client';

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
                nodeId
                tree
            }
            dependenciesTreeTargets {
                attributeId
                nodeId
                tree
            }
        }
    }
`;
