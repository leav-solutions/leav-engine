// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {attributeDetailsFragment} from '../attributes/attributeFragments';

export const getLibByIdQuery = gql`
    ${attributeDetailsFragment}
    query GET_LIB_BY_ID($id: ID, $lang: [AvailableLanguage!]) {
        libraries(filters: {id: $id}) {
            list {
                id
                system
                label
                behavior
                attributes {
                    ...AttributeDetails
                }
                permissions_conf {
                    permissionTreeAttributes {
                        id
                        ... on TreeAttribute {
                            linked_tree
                        }
                        label(lang: $lang)
                    }
                    relation
                }
                recordIdentityConf {
                    label
                    color
                    preview
                }
                defaultView {
                    id
                }
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
