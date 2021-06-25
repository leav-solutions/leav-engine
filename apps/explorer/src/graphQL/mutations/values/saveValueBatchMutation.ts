// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const saveValueBatchMutation = gql`
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
                    format
                    type
                    system
                }

                ... on Value {
                    value
                    raw_value
                }

                ... on LinkValue {
                    linkValue: value {
                        id
                        whoAmI {
                            id
                            label
                            color
                            library {
                                id
                                label
                                gqlNames {
                                    query
                                    type
                                }
                            }
                            preview {
                                small
                                medium
                                big
                                pages
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
