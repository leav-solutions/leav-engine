// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from '@leav/ui';

export const getMe = gql`
    ${recordIdentityFragment}
    query ME {
        me {
            login
            ...RecordIdentity
        }
    }
`;

export const getMeWithPermissions = gql`
    ${recordIdentityFragment}
    query ME_AND_PERMISSIONS($type: PermissionTypes!, $actions: [PermissionsActions!]!) {
        me {
            login
            ...RecordIdentity
        }
        permissions: isAllowed(type: $type, actions: $actions) {
            name
            allowed
        }
    }
`;
