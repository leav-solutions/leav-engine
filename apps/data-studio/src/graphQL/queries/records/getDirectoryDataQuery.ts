// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getLibraryGraphqlNames} from '@leav/utils';
import {gqlUnchecked} from 'utils';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import recordIdentityFragment from './recordIdentityFragment';
import {noopQuery} from '../noopQuery';

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
    [libraryName: string]: {
        list: IDirectoryDataElement[];
    };
}

export interface IDirectoryDataQueryVariables {
    directoryId: string;
}

export const getDirectoryDataQuery = (libraryId: string) => {
    if (!libraryId) {
        return noopQuery;
    }

    return gqlUnchecked`
    ${recordIdentityFragment}
    query GET_DIRECTORY_DATA($directoryId: String!) {
        ${getLibraryGraphqlNames(libraryId).query}(
            filters: [{field: "id", value: $directoryId, condition: EQUAL}])
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
                library {
                    behavior
                }
            }
        }
    }`;
};
