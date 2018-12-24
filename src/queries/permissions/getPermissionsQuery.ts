import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_PERMISSIONS, GET_PERMISSIONSVariables} from 'src/_gqlTypes/GET_PERMISSIONS';

export const getPermissionsQuery = gql`
    query GET_PERMISSIONS(
        $type: PermissionTypes!
        $applyTo: ID
        $actions: [PermissionsActions!]!
        $usersGroup: ID!
        $permissionTreeTarget: PermissionsTreeTargetInput
    ) {
        permissions(
            type: $type
            applyTo: $applyTo
            actions: $actions
            usersGroup: $usersGroup
            permissionTreeTarget: $permissionTreeTarget
        ) {
            name
            allowed
        }
    }
`;

export class PermissionsQuery extends Query<GET_PERMISSIONS, GET_PERMISSIONSVariables> {}
