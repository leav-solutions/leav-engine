import {gql} from '@apollo/client';
import {attributeValuesListDetailsFragment} from './attributeFragments';

export const getAttributeValuesListQuery = gql`
    ${attributeValuesListDetailsFragment}
    query GET_ATTRIBUTES_VALUES_LIST($attrId: ID!) {
        attributes(filters: {id: $attrId}) {
            list {
                id
                label
                type
                format
                ...AttributeValuesListDetails
                ... on LinkAttribute {
                    linked_library {
                        id
                    }
                    reverse_link
                }
                ... on TreeAttribute {
                    linked_tree {
                        id
                    }
                }
            }
        }
    }
`;
