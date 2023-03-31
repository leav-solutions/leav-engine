// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {applicationDetailsFragment} from 'graphQL/queries/applications/applicationDetailsFragment';

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
