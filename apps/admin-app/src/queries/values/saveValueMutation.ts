// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const saveValueQuery = gql`
    ${recordIdentityFragment}
    mutation SAVE_VALUE(
        $library: ID!
        $recordId: ID!
        $attribute: ID!
        $value: ValueInput!
        $lang: [AvailableLanguage!]
    ) {
        saveValue(library: $library, recordId: $recordId, attribute: $attribute, value: $value) {
            id_value

            attribute {
                id
            }

            ... on Value {
                value
                raw_value
            }

            ... on LinkValue {
                linkValue: value {
                    ...RecordIdentity
                }
            }

            ... on TreeValue {
                treeValue: value {
                    record {
                        ...RecordIdentity
                    }
                }
            }
        }
    }
`;
