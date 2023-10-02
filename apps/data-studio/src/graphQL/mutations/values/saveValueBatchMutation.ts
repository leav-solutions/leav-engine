// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
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
