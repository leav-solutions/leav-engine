// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const saveAttributesEmbeddedFieldsQuery = gql`
    mutation SAVE_ATTRIBUTE_EMBEDDED_FIELDS($attribute: AttributeInput) {
        saveAttribute(attribute: $attribute) {
            id
            label
            format
        }
    }
`;
