// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import recordIdentityFragment from './recordIdentityFragment';

export interface IDirectoryDataElement extends RecordIdentity {
    created_at: string;
    created_by: RecordIdentity;
    modified_at: string;
    modified_by: RecordIdentity;
    file_name: string;
    file_path: string;
    library: {
        behavior: 'standard' | 'files' | 'directories';
    };
}

export interface IDirectoryDataQuery {
    records: {
        list: IDirectoryDataElement[];
    };
}

export interface IDirectoryDataQueryVariables {
    library: string;
    directoryId: string;
}

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
