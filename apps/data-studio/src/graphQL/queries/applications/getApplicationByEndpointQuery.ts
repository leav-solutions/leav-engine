// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import recordIdentityFragment from '../records/recordIdentityFragment';

export const getApplicationByEndpointQuery = gql`
    ${recordIdentityFragment}
    query GET_APPLICATION_BY_ENDPOINT($endpoint: String!) {
        applications(filters: {endpoint: $endpoint}) {
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
                libraries {
                    id
                }
                trees {
                    id
                }
                permissions {
                    access_application
                }
                settings
            }
        }
    }
`;