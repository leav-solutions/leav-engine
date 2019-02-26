import gql from 'graphql-tag';
import {Mutation} from 'react-apollo';
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

export class SavePermissionsMutation extends Mutation<SAVE_PERMISSION, SAVE_PERMISSIONVariables> {}
