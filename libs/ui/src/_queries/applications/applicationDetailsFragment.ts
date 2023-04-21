// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const applicationDetailsFragment = gql`
    ${recordIdentityFragment}
    fragment DetailsApplication on Application {
        id
        label
        type
        description
        endpoint
        url
        color
        icon {
            ...RecordIdentity
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
