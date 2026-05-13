import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const getApplicationsQuery = gql`
    ${recordIdentityFragment}
    query GET_APPLICATIONS($filters: ApplicationsFiltersInput, $sort: SortApplications) {
        applications(filters: $filters, sort: $sort) {
            list {
                id
                label
                type
                description
                endpoint
                color
                icon {
                    ...RecordIdentity
                }
                url
                system
            }
        }
    }
`;
