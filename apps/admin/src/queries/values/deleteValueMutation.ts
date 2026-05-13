import {gql} from '@apollo/client';

export const deleteValueQuery = gql`
    mutation DELETE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $valueId: ID) {
        deleteValue(library: $library, recordId: $recordId, attribute: $attribute, value: {id_value: $valueId}) {
            attribute {
                id
            }
            id_value
        }
    }
`;
