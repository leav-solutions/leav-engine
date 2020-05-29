import gql from 'graphql-tag';

export const saveValueBatchQuery = gql`
    mutation SAVE_VALUE_BATCH(
        $library: ID!
        $recordId: ID!
        $version: [ValueVersionInput!]
        $values: [ValueBatchInput!]!
    ) {
        saveValueBatch(library: $library, recordId: $recordId, version: $version, values: $values) {
            values {
                id_value
                value
                raw_value
                modified_at
                created_at
                version
                attribute
            }
            errors {
                type
                attribute
                input
                message
            }
        }
    }
`;
