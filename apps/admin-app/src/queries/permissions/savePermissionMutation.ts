// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
                nodeId
                tree
            }
        }
    }
`;
