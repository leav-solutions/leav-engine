// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
