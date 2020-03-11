import gql from 'graphql-tag';

export const saveValueQuery = gql`
    mutation SAVE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput!) {
        saveValue(library: $library, recordId: $recordId, attribute: $attribute, value: $value) {
            id_value
            value
            raw_value
            attribute
        }
    }
`;
