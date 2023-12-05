// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {Override} from '@leav/utils';
import {GetFileDataQuery} from '_gqlTypes';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import recordIdentityFragment from './recordIdentityFragment';

export interface IFilePreviewsStatusVersion {
    message: string;
    status: number;
}

export interface IFilePreviewsStatus {
    [versionName: string]: IFilePreviewsStatusVersion;
}

export type IFileDataWithPreviewsStatus = Override<
    GetFileDataQuery['records']['list'][number],
    {
        previews_status: IFilePreviewsStatus;
        isPreviewsGenerationPending: boolean;
    }
>;

export interface IFileDataElement extends RecordIdentity {
    created_at: string;
    created_by: RecordIdentity;
    modified_at: string;
    modified_by: RecordIdentity;
    file_name: string;
    file_path: string;
    previews_status: string; // JSON string
    library: {
        behavior: 'standard' | 'files' | 'directories';
    };
}

export interface IFileDataQuery {
    records: {
        list: IFileDataElement[];
    };
}

export interface IFileDataQueryVariables {
    library: string;
    fileId: string;
}

export const getFileDataQuery = gql`
    ${recordIdentityFragment}
    query GET_FILE_DATA($library: ID!, $fileId: String!, $previewsStatusAttribute: ID!) {
        records(library: $library, filters: [{field: "id", value: $fileId, condition: EQUAL}]) {
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
                previews_status: property(attribute: $previewsStatusAttribute) {
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
