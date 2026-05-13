import {gql} from '@apollo/client';
import {applicationDetailsFragment} from '../../queries/applications/applicationDetailsFragment';

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
