// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordSortInput, ValueVersionInput} from '_gqlTypes/globalTypes';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import {IQueryFilter} from '../../../_types/types';

export interface IGetRecordsFromLibraryQueryElement extends RecordIdentity {
    [x: string]: any;
}

export interface IGetRecordsFromLibraryQuery {
    records: {
        list: IGetRecordsFromLibraryQueryElement[];
        totalCount: number;
    };
}

export interface IGetRecordsFromLibraryQueryVariables {
    library: string;
    limit?: number;
    offset?: number;
    filters?: IQueryFilter[];
    sort?: RecordSortInput;
    fullText?: string;
    version?: ValueVersionInput[];
}
