import gql from 'graphql-tag';
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
                    linked_library
                }
                ... on TreeAttribute {
                    linked_tree
                }
            }
        }
    }
`;
