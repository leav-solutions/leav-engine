// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from 'graphql-tag';

export const deleteValueMutation = gql`
    mutation DELETE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput) {
        deleteValue(library: $library, recordId: $recordId, attribute: $attribute, value: $value) {
            id_value
            attribute {
                id
                format
                type
                system
            }
        }
    }
`;
