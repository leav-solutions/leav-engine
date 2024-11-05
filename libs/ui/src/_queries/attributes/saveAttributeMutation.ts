// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {attributeDetailsFragment} from './attributeDetailsFragment';

export const saveAttributeMutation = gql`
    ${attributeDetailsFragment}
    mutation SAVE_ATTRIBUTE($attribute: AttributeInput!) {
        saveAttribute(attribute: $attribute) {
            ...AttributeDetails
        }
    }
`;
