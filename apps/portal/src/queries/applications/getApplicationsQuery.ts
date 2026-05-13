import {gql} from '@apollo/client';
import {applicationDetailsFragment} from './applicationDetailsFragment';

export const getApplicationsQuery = gql`
    ${applicationDetailsFragment}
    query GET_APPLICATIONS($filters: ApplicationsFiltersInput) {
        applications(filters: $filters) {
            list {
                ...ApplicationDetails
            }
        }
    }
`;
