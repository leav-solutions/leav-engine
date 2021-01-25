// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {attributeValuesListDetailsFragment} from './attributeFragments';

export const saveAttributeQuery = gql`
    ${attributeValuesListDetailsFragment}
    mutation SAVE_ATTRIBUTE($attrData: AttributeInput!) {
        saveAttribute(attribute: $attrData) {
            id
            type
            format
            system
            label
            multiple_values
            permissions_conf {
                permissionTreeAttributes {
                    id
                    ... on TreeAttribute {
                        linked_tree {
                            id
                        }
                    }
                    label
                }
                relation
            }
            versions_conf {
                versionable
                mode
                trees
            }
            metadata_fields {
                id
                label
                type
                format
            }
            ...AttributeValuesListDetails
            ... on LinkAttribute {
                linked_library {
                    id
                }
            }
            ... on TreeAttribute {
                linked_tree {
                    id
                }
            }
        }
    }
`;
