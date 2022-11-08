// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import recordIdentityFragment from 'graphQL/queries/records/recordIdentityFragment';
import {valuesVersionDetailsFragment} from 'graphQL/queries/values/valuesVersionFragment';

export const saveValueBatchMutation = gql`
    ${recordIdentityFragment}
    ${valuesVersionDetailsFragment}
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
                id_value
                modified_at
                modified_by {
                    ...RecordIdentity
                }
                created_at
                created_by {
                    ...RecordIdentity
                }
                version {
                    ...ValuesVersionDetails
                }
                attribute {
                    id
                    format
                    type
                    system
                }
                metadata {
                    name
                    value {
                        id_value
                        modified_at
                        modified_by {
                            ...RecordIdentity
                        }
                        created_at
                        created_by {
                            ...RecordIdentity
                        }
                        version {
                            ...ValuesVersionDetails
                        }
                        value
                        raw_value
                    }
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
                        id
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
