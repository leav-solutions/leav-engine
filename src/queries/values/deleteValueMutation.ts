import gql from 'graphql-tag';

export const deleteValueQuery = gql`
    mutation DELETE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $valueId: ID) {
        deleteValue(library: $library, recordId: $recordId, attribute: $attribute, valueId: $valueId) {
            attribute
            id_value
            value
        }
    }
`;
