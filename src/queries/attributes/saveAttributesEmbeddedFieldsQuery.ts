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
