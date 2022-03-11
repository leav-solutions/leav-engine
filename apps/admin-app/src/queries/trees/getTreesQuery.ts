// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getTreesQueryName = 'GET_TREES';

export const getTreesQuery = gql`
    query GET_TREES($id: ID, $label: String, $system: Boolean, $lang: [AvailableLanguage!]) {
        trees(filters: {id: $id, label: $label, system: $system}) {
            totalCount
            list {
                id
                label(lang: $lang)
                system
                behavior
                libraries {
                    library {
                        id
                        label
                    }
                    settings {
                        allowMultiplePositions
                        allowedAtRoot
                        allowedChildren
                    }
                }
            }
        }
    }
`;
