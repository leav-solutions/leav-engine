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
