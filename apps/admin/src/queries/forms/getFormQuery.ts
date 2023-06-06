// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {formDetailsFragment} from './formDetailsFragment';

export const getFormQuery = gql`
    ${formDetailsFragment}
    query GET_FORM($library: ID!, $id: ID!) {
        forms(filters: {library: $library, id: $id}) {
            totalCount
            list {
                ...FormDetails
            }
        }
    }
`;
