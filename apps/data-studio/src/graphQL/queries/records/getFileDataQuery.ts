// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getLibraryGraphqlNames} from '@leav/utils';
import {gqlUnchecked} from 'utils';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import recordIdentityFragment from './recordIdentityFragment';

export interface IFileDataElement extends RecordIdentity {
    created_at: string;
    created_by: RecordIdentity;
    modified_at: string;
    modified_by: RecordIdentity;
    file_name: string;
    file_path: string;
    file_type: 'image' | 'video' | 'audio' | 'document' | 'other';
    library: {
        behavior: 'standard' | 'files' | 'directories';
    };
}

export interface IFileDataQuery {
    [libraryName: string]: {
        list: IFileDataElement[];
    };
}

export interface IFileDataQueryVariables {
    fileId: string;
}

export const getFileDataQuery = (libraryId: string) => gqlUnchecked`
    ${recordIdentityFragment}
    query GET_FILE_DATA($fileId: String!) {
        ${getLibraryGraphqlNames(libraryId).query}(
            filters: [{field: "id", value: $fileId, condition: EQUAL}])
        {
            list {
                ...RecordIdentity
                created_at
                created_by {
                    ...RecordIdentity
                }
                modified_at
                modified_by {
                    ...RecordIdentity
                }
                file_name
                file_path
                file_type
                library {
                    behavior
                }
            }
        }
    }`;
