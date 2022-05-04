// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getApplicationsQuery = gql`
    query GET_APPLICATIONS($filters: ApplicationsFiltersInput, $sort: SortApplications) {
        applications(filters: $filters, sort: $sort) {
            list {
                id
                label
                description
                endpoint
                color
                icon
            }
        }
    }
`;
