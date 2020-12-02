// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
