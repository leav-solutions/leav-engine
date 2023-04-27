// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {identityRecordFragment} from '../records/recordIdentityFragment';

export const applicationDetailsFragment = gql`
    ${identityRecordFragment}
    fragment DetailsApplication on Application {
        id
        label
        type
        description
        endpoint
        url
        color
        icon {
            ...IdentityRecord
        }
        module
        libraries {
            id
        }
        trees {
            id
        }
        permissions {
            access_application
            admin_application
        }
        settings
    }
`;
