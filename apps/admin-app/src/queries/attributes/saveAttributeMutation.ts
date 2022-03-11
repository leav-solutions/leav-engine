// Copyright LEAV Solutions 2017
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
        }
    }
`;
