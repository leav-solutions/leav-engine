// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from 'graphql-tag';
import recordIdentityFragment from 'graphQL/queries/records/recordIdentityFragment';

export const saveValueMutation = gql`
    ${recordIdentityFragment}

    mutation SAVE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput!) {
        saveValue(library: $library, recordId: $recordId, attribute: $attribute, value: $value) {
            id_value
            created_at
            created_by {
                ...RecordIdentity
            }
            modified_at
            modified_by {
                ...RecordIdentity
            }

            ... on Value {
                value
                raw_value
            }

            ... on LinkValue {
                linkValue: value {
                    id
                    ...RecordIdentity
                }
            }
        }
    }
`;
