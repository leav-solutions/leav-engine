import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

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
                version {
                    treeId
                    treeNode {
                        id
                        record {
                            id
                            whoAmI {
                                id
                                label
                                library {
                                    id
                                }
                            }
                        }
                    }
                }
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
