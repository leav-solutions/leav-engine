import {gql} from '@apollo/client';

export const isAllowedQuery = gql`
    query IS_ALLOWED(
        $type: PermissionTypes!
        $applyTo: ID
        $actions: [PermissionsActions!]!
        $target: PermissionTarget
    ) {
        isAllowed(type: $type, actions: $actions, applyTo: $applyTo, target: $target) {
            name
            allowed
        }
    }
`;
