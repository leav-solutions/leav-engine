// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const getApplicationByIdQuery = gql`
    ${recordIdentityFragment}
    query GET_APPLICATION_BY_ID($id: ID!) {
        applications(filters: {id: $id}) {
            list {
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
                install {
                    status
                    lastCallResult
                }
                settings
            }
        }
    }
`;
