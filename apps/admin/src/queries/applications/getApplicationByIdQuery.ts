// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';
import {applicationDetailsFragment} from './applicationDetailsFragment';

export const getApplicationByIdQuery = gql`
    ${recordIdentityFragment}
    ${applicationDetailsFragment}
    query GET_APPLICATION_BY_ID($id: ID!) {
        applications(filters: {id: $id}) {
            list {
                ...ApplicationDetails
            }
        }
    }
`;
