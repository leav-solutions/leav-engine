// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
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
