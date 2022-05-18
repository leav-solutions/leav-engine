// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import recordIdentityFragment from '../records/recordIdentityFragment';

export const getApplicationsQuery = gql`
    ${recordIdentityFragment}
    query GET_APPLICATIONS {
        applications {
            list {
                id
                label
                description
                endpoint
                url
                color
                icon {
                    ...RecordIdentity
                }
            }
        }
    }
`;
