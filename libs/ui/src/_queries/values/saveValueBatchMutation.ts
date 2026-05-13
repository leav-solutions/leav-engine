import {gql} from '@apollo/client';
import {valueDetailsFragment} from './valueDetailsFragment';

export const saveValueBatchMutation = gql`
    ${valueDetailsFragment}
    mutation SAVE_VALUE_BATCH(
        $library: ID!
        $recordId: ID!
        $version: [ValueVersionInput!]
        $values: [ValueBatchInput!]!
        $deleteEmpty: Boolean
    ) {
        saveValueBatch(
            library: $library
            recordId: $recordId
            version: $version
            values: $values
            deleteEmpty: $deleteEmpty
        ) {
            values {
                ...ValueDetails
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
