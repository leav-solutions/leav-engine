import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {SAVE_PERMISSION, SAVE_PERMISSIONVariables} from '../../_gqlTypes/SAVE_PERMISSION';

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

export const SavePermissionsMutation = p => Mutation<SAVE_PERMISSION, SAVE_PERMISSIONVariables>(p);
