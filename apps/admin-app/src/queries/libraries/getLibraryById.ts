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
                fullTextAttributes {
                    id
                    label
                }
                permissions_conf {
                    permissionTreeAttributes {
                        id
                        ... on TreeAttribute {
                            linked_tree {
                                id
                            }
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
                permissions {
                    admin_library
                    access_library
                    access_record
                    create_record
                    edit_record
                    delete_record
                }
            }
        }
    }
`;
