// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getLibsQuery = gql`
    query GET_LIBRARIES($id: ID, $label: String, $system: Boolean, $behavior: [LibraryBehavior!]) {
        libraries(filters: {id: $id, label: $label, system: $system, behavior: $behavior}) {
            totalCount
            list {
                id
                system
                label
                behavior
                gqlNames {
                    query
                    type
                    list
                    filter
                    searchableFields
                }
            }
        }
    }
`;
