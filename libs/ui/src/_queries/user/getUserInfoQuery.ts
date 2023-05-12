// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {identityRecordFragment} from '../records/recordIdentityFragment';

export const getUserInfoQuery = gql`
    ${identityRecordFragment}
    query USER_INFO($type: PermissionTypes!, $actions: [PermissionsActions!]!) {
        me {
            login
            ...IdentityRecord
        }
        permissions: isAllowed(type: $type, actions: $actions) {
            name
            allowed
        }
    }
`;
