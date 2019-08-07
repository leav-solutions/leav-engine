import {Query} from '@apollo/react-components';
import gql from 'graphql-tag';
import {GET_PERMISSIONS, GET_PERMISSIONSVariables} from '../../_gqlTypes/GET_PERMISSIONS';

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

/* tslint:disable-next-line:variable-name */
export const PermissionsQuery = p => Query<GET_PERMISSIONS, GET_PERMISSIONSVariables>(p);
