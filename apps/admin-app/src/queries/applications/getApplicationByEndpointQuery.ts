// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';
import {applicationDetailsFragment} from './applicationDetailsFragment';

export const getApplicationByEndpointQuery = gql`
    ${recordIdentityFragment}
    ${applicationDetailsFragment}
    query GET_APPLICATION_BY_ENDPOINT($endpoint: String!) {
        applications(filters: {endpoint: $endpoint}) {
            list {
                ...ApplicationDetails
            }
        }
    }
`;
