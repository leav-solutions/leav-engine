// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getLibrariesWithAttributesQuery = gql`
    query GET_LIBRARIES_WITH_ATTRIBUTES {
        libraries {
            totalCount
            list {
                id
                label
                gqlNames {
                    query
                    type
                    list
                    filter
                    searchableFields
                }
                attributes {
                    id
                    label
                }
            }
        }
    }
`;
