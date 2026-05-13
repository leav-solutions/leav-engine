import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const saveValueQuery = gql`
    ${recordIdentityFragment}
    mutation SAVE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput!) {
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
