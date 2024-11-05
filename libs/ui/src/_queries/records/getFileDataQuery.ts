// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {Override} from '@leav/utils';
import {GetFileDataQuery} from '_ui/_gqlTypes';
import {recordIdentityFragment} from '../../gqlFragments';

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
