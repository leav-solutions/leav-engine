// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const applicationDetailsFragment = gql`
    ${recordIdentityFragment}
    fragment ApplicationDetails on Application {
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
        permissions {
            access_application
        }
    }
`;
