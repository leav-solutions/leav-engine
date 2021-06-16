// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const saveValueQuery = gql`
    mutation SAVE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput!) {
        saveValue(library: $library, recordId: $recordId, attribute: $attribute, value: $value) {
            id_value
            value
            raw_value
            attribute {
                id
            }
        }
    }
`;
