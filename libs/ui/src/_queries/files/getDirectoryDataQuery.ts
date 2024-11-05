// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from '_ui/gqlFragments';

export const getDirectoryDataQuery = gql`
    ${recordIdentityFragment}
    query GET_DIRECTORY_DATA($library: ID!, $directoryId: String!) {
        records(library: $library, filters: [{field: "id", value: $directoryId, condition: EQUAL}]) {
            list {
                ...RecordIdentity
                created_at: property(attribute: "created_at") {
                    ... on Value {
                        value
                    }
                }
                created_by: property(attribute: "created_by") {
                    ... on LinkValue {
                        value {
                            ...RecordIdentity
                        }
                    }
                }
                modified_at: property(attribute: "modified_at") {
                    ... on Value {
                        value
                    }
                }
                modified_by: property(attribute: "modified_by") {
                    ... on LinkValue {
                        value {
                            ...RecordIdentity
                        }
                    }
                }
                file_name: property(attribute: "file_name") {
                    ... on Value {
                        value
                    }
                }
                file_path: property(attribute: "file_path") {
                    ... on Value {
                        value
                    }
                }
                library {
                    behavior
                }
            }
        }
    }
`;
