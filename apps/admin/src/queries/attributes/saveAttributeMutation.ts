import {gql} from '@apollo/client';
import {attributeDetailsFragment, attributeValuesListDetailsFragment} from './attributeFragments';

export const saveAttributeQuery = gql`
    ${attributeValuesListDetailsFragment}
    ${attributeDetailsFragment}
    mutation SAVE_ATTRIBUTE($attrData: AttributeInput!) {
        saveAttribute(attribute: $attrData) {
            ...AttributeDetails
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
`;
