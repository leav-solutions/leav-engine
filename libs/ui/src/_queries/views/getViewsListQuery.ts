// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import viewDetailsFragment from './viewDetailsFragment';

export const getViewsListQuery = gql`
    ${viewDetailsFragment}
    query GET_VIEWS_LIST($libraryId: String!) {
        views(library: $libraryId) {
            totalCount
            list {
                ...ViewDetails
            }
        }
    }
`;
