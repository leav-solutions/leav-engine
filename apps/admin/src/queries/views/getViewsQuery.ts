// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getViewsQuery = gql`
    query GET_VIEWS($library: String!) {
        views(library: $library) {
            list {
                id
                label
            }
        }
    }
`;
