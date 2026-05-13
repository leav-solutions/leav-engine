import {gql} from '@apollo/client';
import {applicationDetailsFragment} from './applicationDetailsFragment';

export const getApplicationsEventsSubscription = gql`
    ${applicationDetailsFragment}
    subscription APPLICATION_EVENTS($filters: ApplicationEventFiltersInput) {
        applicationEvent(filters: $filters) {
            type
            application {
                ...ApplicationDetails
            }
        }
    }
`;
