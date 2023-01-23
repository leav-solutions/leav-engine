// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const isAllowedQuery = gql`
    query IS_ALLOWED(
        $type: PermissionTypes!
        $actions: [PermissionsActions!]!
        $applyTo: ID
        $target: PermissionTarget
    ) {
        isAllowed(type: $type, actions: $actions, applyTo: $applyTo, target: $target) {
            name
            allowed
        }
    }
`;
