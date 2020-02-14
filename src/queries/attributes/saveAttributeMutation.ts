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
                        linked_tree
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
                linked_library
            }
            ... on TreeAttribute {
                linked_tree
            }
        }
    }
`;
