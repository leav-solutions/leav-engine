import {Query} from '@apollo/react-components';
import gql from 'graphql-tag';
import {GET_LIBRARIES, GET_LIBRARIESVariables} from '../../_gqlTypes/GET_LIBRARIES';
import {attributeDetailsFragment} from '../attributes/attributeFragments';

export const getLibsQuery = gql`
    ${attributeDetailsFragment}
    query GET_LIBRARIES($id: ID, $label: String, $system: Boolean, $lang: [AvailableLanguage!]) {
        libraries(filters: {id: $id, label: $label, system: $system}) {
            totalCount
            list {
                id
                system
                label
                attributes {
                    ...AttributeDetails
                }
                permissions_conf {
                    permissionTreeAttributes {
                        id
                        linked_tree
                        label(lang: $lang)
                    }
                    relation
                }
                recordIdentityConf {
                    label
                    color
                    preview
                }
                gqlNames {
                    query
                    type
                    list
                    filter
                    searchableFields
                }
            }
            __typename
        }
    }
`;

/* tslint:disable-next-line:variable-name */
export const LibrariesQuery = p => Query<GET_LIBRARIES, GET_LIBRARIESVariables>(p);
