import {gql} from '@apollo/client';
import {applicationDetailsFragment} from './applicationDetailsFragment';

export const getApplicationByEndpointQuery = gql`
    ${applicationDetailsFragment}
    query GET_APPLICATION_BY_ENDPOINT($endpoint: String!) {
        applications(filters: {endpoint: $endpoint}) {
            list {
                ...ApplicationDetails
            }
        }
    }
`;
