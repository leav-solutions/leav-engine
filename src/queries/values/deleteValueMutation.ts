import gql from 'graphql-tag';

export const deleteValueQuery = gql`
    mutation DELETE_VALUE($library: ID, $recordId: ID, $attribute: ID, $value: ValueInput) {
        deleteValue(library: $library, recordId: $recordId, attribute: $attribute, value: $value) {
            attribute
            id_value
            value
        }
    }
`;
