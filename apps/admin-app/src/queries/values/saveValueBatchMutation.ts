// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const saveValueBatchQuery = gql`
    ${recordIdentityFragment}
    mutation SAVE_VALUE_BATCH(
        $library: ID!
        $recordId: ID!
        $version: [ValueVersionInput!]
        $values: [ValueBatchInput!]!
    ) {
        saveValueBatch(library: $library, recordId: $recordId, version: $version, values: $values) {
            values {
                id_value
                modified_at
                created_at
                version
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

                        ancestors {
                            record {
                                ...RecordIdentity
                            }
                        }
                    }
                }
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
