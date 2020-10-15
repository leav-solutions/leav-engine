import gql from 'graphql-tag';

export const getPermissionsActionsQuery = gql`
    query GET_PERMISSIONS_ACTIONS($type: PermissionTypes!, $applyOn: String) {
        permissionsActionsByType(type: $type, applyOn: $applyOn) {
            name
            label
        }
    }
`;
